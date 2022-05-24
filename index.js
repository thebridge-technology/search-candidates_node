const express = require('express')
const app = express()
const port = 3001

const merchant_model = require('./candidates_model')
const Credential = require('./credentials')

app.use(express.json())
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.get('/candidates', (req, res) => {
  if (role = Credential.Authorization(req.headers.authorization)) {
    const {page} = req.query
    merchant_model.getCandidates(req.query, role)
      .then(response => {
        res.status(200).send({
          'data': response.data,
          'total': response.result_total.total,
          'total_pages': Math.ceil(response.result_total.total / 50),
          'current_page': page ?? 1
        });
      })
      .catch(error => {
        res.status(500).send(error);
      })
  } else {
    res.status(404).send({"message": "Authentication required"});
  }
})

app.post('/login', (req, res) => {
  if (token = Credential.Login(req.body)) {
    res.status(200).send({"token": token})
  }
  res.status(409).send({"message": "credentials invalid"})
})

app.get('/level', (req, res) => {
  merchant_model.getLevels()
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.get('/state', (req, res) => {
  merchant_model.getStates()
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.get('/stack', (req, res) => {
  merchant_model.geStacks()
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.get('/count', (req, res) => {
  merchant_model.getCountRows()
    .then(response => {
      res.status(200).send(response);
    })
    .catch(error => {
      res.status(500).send(error);
    })
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})