#  Basic Query Builder

A **SQL** Query Builder written in modern Vanilla JavaScript.

##  Features

-  SQL Injection Protection**: Uses parameter binding (`?` placeholders) instead of string concatenation.
-  Fluent Interface**: Chain methods for readable, maintainable code (`db.from('users').select('id').where(...)`).
-  Multi-Dialect Support**: Automatically adapts syntax for MySQL, PostgreSQL, and SQLite.
-  AST-Based Architecture**: Internally builds an Abstract Syntax Tree before compilation, allowing for easy extension.
-  Zero Dependencies**: Works in any modern browser or Node.js environment without `npm install`.

---

## 🛠️ Usage Examples

### Basic Select
```javascript
const qb = new QueryBuilder({ dialect: 'mysql' });
qb.from('users')
  .select('id', 'name', 'email')
  .where('status = ?', 'active')
  .orderBy('created_at', 'DESC')
  .limit(10);

const result = qb.compile();
console.log(result.sql); 
// Output: SELECT `id`, `name`, `email` FROM `users` WHERE status = ? ORDER BY `created_at` DESC LIMIT 10

console.log(result.params); 
// Output: ['active']
```
---

## Project Structure
```txt
flexilayout-studio/
├── index.html
├── styles.css
├── script.js
├── QueryBuilder.js
└── README.md
