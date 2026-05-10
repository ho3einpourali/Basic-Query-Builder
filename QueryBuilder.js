class QueryBuilder {
  constructor(config = {}) {
    this.config = {
      dialect: config.dialect || "mysql",
      params: [],
      table: null,
      alias: null,
    };

    this.ast = {
      type: "root",
      children: [],
    };
  }

  from(table, alias) {
    this.config.table = table;
    this.config.alias = alias;
    return this;
  }

  select(...columns) {
    this._addClause("select", { columns: columns });
    return this;
  }

  update(values) {
    this._setQueryType("update");

    const sets = Object.keys(values).map((key) => ({
      column: key,
      value: values[key],
    }));

    this._addClause("updateSet", { sets });
    return this;
  }

  delete() {
    this._setQueryType("delete");
    return this;
  }

  where(condition, ...params) {
    this._addClause("where", { condition, params });
    return this;
  }

  orWhere(condition, ...params) {
    this._addClause("orWhere", { condition, params });
    return this;
  }

  orderBy(column, direction = "ASC") {
    const dir = direction.toUpperCase() === "DESC" ? "DESC" : "ASC";
    this._addClause("orderBy", { column, direction: dir });
    return this;
  }

  limit(limit) {
    this._addClause("limit", { limit: parseInt(limit, 10) });
    return this;
  }

  offset(offset) {
    this._addClause("offset", { offset: parseInt(offset, 10) });
    return this;
  }

  returning(columns = "*") {
    this._addClause("returning", { columns });
    return this;
  }

  compile() {
    const { dialect, table, alias } = this.config;
    const queryType = this.config.queryType || "select";

    if (!table) {
      throw new Error("Query must start with .from()");
    }

    const compiledClauses = this.ast.children
      .filter((clause) => clause.type !== "root")
      .map((clause) => this._compileClause(clause, dialect, queryType));

    let sql = "";

    switch (queryType) {
      case "update":
        sql = `UPDATE ${this._escapeIdentifier(table)}`;
        if (alias) sql += ` AS ${this._escapeIdentifier(alias)}`;
        break;
      case "delete":
        sql = `DELETE FROM ${this._escapeIdentifier(table)}`;
        if (alias) sql += ` AS ${this._escapeIdentifier(alias)}`;
        break;
      case "select":
      default:
        sql = `SELECT`;
        break;
    }

    if (compiledClauses.length > 0) {
      compiledClauses.forEach((compiled) => {
        sql += ` ${compiled}`;
      });
    } else if (queryType === "select") {
      sql += ` *`;
    }

    return {
      sql: sql.trim(),
      params: this.config.params,
    };
  }

  _setQueryType(type) {
    this.config.queryType = type;
  }

  _addClause(type, data) {
    this.ast.children.push({ type, data });
  }

  _compileClause(clause, dialect, queryType) {
    const { type, data } = clause;
    const params = data.params || [];

    if (params.length > 0) {
      this.config.params.push(...params);
    }

    const replacePlaceholder = (str) => {
      if (dialect === "postgresql") {
        const paramIndex = this.config.params.length - params.length;
        return str.replace(
          /\?/g,
          () => `$${paramIndex + this.config.params.indexOf("?") + 1}`,
        );
      }
      return str.replace(/\?/g, "?");
    };

    switch (type) {
      case "select":
        const cols = data.columns
          .map((c) => {
            if (c === "*") return "*";
            return this._escapeIdentifier(c);
          })
          .join(", ");
        return `SELECT ${cols}`;

      case "updateSet":
        const setClauses = data.sets
          .map((set) => {
            const col = this._escapeIdentifier(set.column);
            return `${col} = ?`;
          })
          .join(", ");
        return `SET ${setClauses}`;

      case "where":
        return `WHERE ${replacePlaceholder(data.condition)}`;

      case "orWhere":
        return `OR ${replacePlaceholder(data.condition)}`;

      case "orderBy":
        return `ORDER BY ${this._escapeIdentifier(data.column)} ${data.direction}`;

      case "limit":
        return `LIMIT ${data.limit}`;

      case "offset":
        return `OFFSET ${data.offset}`;

      case "returning":
        const retCols =
          data.columns === "*"
            ? "*"
            : data.columns.map((c) => this._escapeIdentifier(c)).join(", ");
        return `RETURNING ${retCols}`;

      default:
        return "";
    }
  }

  _escapeIdentifier(identifier) {
    if (this.config.dialect === "postgresql") {
      return `"${identifier}"`;
    }
    return `\`${identifier}\``;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = QueryBuilder;
}
