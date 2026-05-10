const queryTypeSelect = document.getElementById("queryType");
const selectFields = document.getElementById("selectFields");
const updateFields = document.getElementById("updateFields");

queryTypeSelect.addEventListener("change", (e) => {
  if (e.target.value === "select") {
    selectFields.style.display = "block";
    updateFields.style.display = "none";
  } else if (e.target.value === "update") {
    selectFields.style.display = "none";
    updateFields.style.display = "block";
  } else {
    selectFields.style.display = "none";
    updateFields.style.display = "none";
  }
});

document.getElementById("buildBtn").addEventListener("click", () => {
  try {
    const queryType = document.getElementById("queryType").value;
    const dialect = document.getElementById("dialect").value;
    const table = document.getElementById("table").value.trim();
    const whereCond = document.getElementById("where").value.trim();
    const param1 = document.getElementById("param1").value;
    const param2 = document.getElementById("param2").value;
    const orderByCol = document.getElementById("orderBy").value.trim();
    const limitVal = document.getElementById("limit").value;

    if (!table) {
      alert("Please enter a table name.");
      return;
    }

    const qb = new QueryBuilder({ dialect });
    qb.from(table);

    if (queryType === "select") {
      const colsInput = document.getElementById("columns").value.trim();
      if (colsInput === "*") {
        qb.select("*");
      } else {
        const cols = colsInput.split(",").map((c) => c.trim());
        qb.select(...cols);
      }
    } else if (queryType === "update") {
      const valuesStr = document.getElementById("updateValues").value.trim();
      if (!valuesStr) {
        alert("Please enter update values in JSON format.");
        return;
      }
      const values = JSON.parse(valuesStr);
      qb.update(values);
    } else if (queryType === "delete") {
      qb.delete();
    }

    if (whereCond) {
      const params = [];
      if (param1) params.push(param1);
      if (param2) params.push(param2);
      qb.where(whereCond, ...params);
    }

    if (orderByCol) {
      qb.orderBy(orderByCol);
    }

    if (limitVal) {
      qb.limit(limitVal);
    }

    const result = qb.compile();
    const outputEl = document.getElementById("sqlOutput");
    outputEl.textContent = result.sql;
    outputEl.className = "output-area";
    if (queryType === "update") outputEl.classList.add("update");
    if (queryType === "delete") outputEl.classList.add("delete");

    document.getElementById("paramsOutput").innerHTML =
      `<strong>Parameters:</strong><br>[${result.params.join(", ")}]`;
  } catch (err) {
    document.getElementById("sqlOutput").textContent = `Error: ${err.message}`;
    document.getElementById("sqlOutput").style.color = "#ef4444";
  }
});
