var express = require('express');
var router = express.Router();
var moment = require('moment');
module.exports = function (pool) {

  /* GET home page. */
  router.get('/', function (req, res, next) {
    const sortBy = req.query.sortBy || 'id'
    const sortMode = req.query.sortMode || 'asc'

    const url = req.url == '/' ? '/?page=1&sortBy=id&sortMode=asc' : req.url
    const page = req.query.page || 1
    const limit = 3
    const offset = (page - 1) * limit
    const wheres = []
    const values = []
    let count = 1

    if (req.query.id) {
      wheres.push(`id = $${count}`)
      values.push(req.query.id)
      count++
    }

    if (req.query.string) {
      wheres.push(`string ilike $${count}`)
      values.push(req.query.string)
      count++
    }

    if (req.query.integer) {
      wheres.push(`integer = $${count}`)
      values.push(req.query.integer)
      count++
    }

    if (req.query.float) {
      wheres.push(`float = $${count}`)
      values.push(req.query.float)
      count++
    }

    if (req.query.date) {
      wheres.push(`date = $${count}`)
      values.push(req.query.date)
      count++
    }

    if (req.query.boolean) {
      wheres.push(`boolean = $${count}`)
      values.push(req.query.boolean)
      count++
    }

    let sql = 'SELECT COUNT(*) AS TOTAL FROM bread';
    if (wheres.length > 0) {
      sql += ` WHERE ${wheres.join(' and ')}`
    }

    pool.query(sql, values, (err, rows) => {
      const pages = Math.ceil(parseInt(rows.rows[0].total) / limit)

      sql = 'SELECT * FROM bread '
      if (wheres.length > 0) {
        sql += `WHERE ${wheres.join(' and ')}`
      }

      // sorting
      sql += ` ORDER BY ${sortBy} ${sortMode}`

      sql += ` LIMIT  $${count} OFFSET  $${count + 1}`

      // callback
      pool.query(sql, [...values, limit, offset], (err, rows) => {
        if (err) {
        } else {
          res.render('list', { title: 'Express', rows: rows.rows, pages, page, moment, url, query: req.query });
        }
      })
    })
  });

  router.get('/add', (req, res) => {
    res.render('add')
  })

  router.post('/add', (req, res) => {
    pool.query(`INSERT INTO bread (string, integer, float, date, boolean) VALUES ($1, $2, $3, $4, $5)`, [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean], (err) => {
      res.redirect('/')
    })
  })

  router.get('/edit/:id', (req, res) => {
    pool.query(`SELECT * FROM bread WHERE id = $1`, [parseInt(req.params.id)], (err, data) => {
      res.render('edit', { item: data.rows[0], moment })
    })
  })

  router.post('/edit/:id', (req, res) => {
    pool.query(`UPDATE bread SET string = $1, integer = $2, float = $3, date = $4, boolean = $5 WHERE id = $6`, [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean, req.params.id], (err, data) => {
      if (err) console.log(err)
      res.redirect('/')
    })
  })

  router.get('/delete/:id', (req, res) => {
    const index = req.params.id
    pool.query(`DELETE FROM bread WHERE id = $1`, [parseInt(req.params.id)], (err,) => {
      res.redirect('/')
    })
  })

  return router;
}
