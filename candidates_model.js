const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const CandidatesSQL = (select, where = '', pagination = '') => {
  return (`
      SELECT ${select}
      FROM candidate AS c
               JOIN candidate_contacts AS cc ON c.id = cc.candidate_id
               JOIN candidate_formation AS cf ON c.id = cf.candidate_id
               JOIN candidate_localization AS cl ON c.id = cl.candidate_id
               JOIN candidate_professional_profile AS cpp ON c.id = cpp.candidate_id
          ${where} ${pagination};
  `);
}

const LevelSQL = `select level
                  from candidate_professional_profile
                  where level is not null
                  group by level`;
const TechStackSQL = `
    SELECT tech_stack_expertise
    FROM candidate_tech_stack_expertise
    WHERE tech_stack_expertise is not null
    group by tech_stack_expertise;
`;

const StateSQL = `
    SELECT state
    FROM candidate_localization
    WHERE state IS NOT NULL
    GROUP BY state;
`

const getCandidates = (body, role) => {
  const {page} = body
  let limit = 50;
  let offset = page ? (page - 1) : 0;
  let select = null;
  switch (role) {
    case 1:
      select = '*';
      break;
    case 2:
      select = 'c.name, cpp.skill, cpp.language, cpp.level, cpp.level';
      break;
    default:
      return null;
  }
  const pagination = `OFFSET ${offset * limit} LIMIT ${limit}`;
  let select_count = 'COUNT(c.id) AS total';
  return new Promise(function (resolve, reject) {
    pool.query(CandidatesSQL(select, CandidatesWhere(body), pagination) + CandidatesSQL(select_count, CandidatesWhere(body)), (error, results) => {
      if (error) {
        reject(error)
      }
      if (results && results.length > 1) {
        resolve({"data": results[0].rows, "result_total": results[1].rows[0]});
      }
      reject({"message": 'Query error'})
    })
  })
}

const CandidatesWhere = (body) => {
  const {name, skills, languages, levels, states, formations} = body
  let where = 'Where cpp.skill IS NOT NULL';
  if (name) {
    where += ' AND ';
    where += `c.name LIKE '%${name}%'`
  }
  if (skills) {
    where += ' AND ';
    skills.forEach((skill) => {
      where += `cpp.skill LIKE '%${skill}%' AND `
    })
    where += '1=1'
  }
  if (levels) {
    where += ' AND ';
    levels.forEach((level) => {
      where += `cpp.level LIKE '%${level}%' AND `
    })
    where += '1=1'
  }
  if (languages) {
    where += ' AND ';
    languages.forEach((language) => {
      where += `cpp.language LIKE '%${language}%' AND `
    })
    where += '1=1'
  }
  if (formations) {
    where += ' AND ';
    formations.forEach((formation) => {
      where += `cf.formation LIKE '%${formation}%' AND `
    })
    where += '1=1'
  }
  if (states) {
    where += ' AND ';
    states.forEach((state) => {
      where += `cl.state LIKE '%${state}%' AND `
    })
    where += '1=1'
  }

  return where;
}

const getCandidatesTotal = (body) => {
  let select = 'COUNT(c.id)';
  return new Promise(function (resolve, reject) {
    pool.query(CandidatesSQL(select, CandidatesWhere(body)), (error, results) => {
      if (error) {
        reject(error)
      }

      resolve(results.rows);
    })
  })
}

const getLevels = () => {
  return new Promise(function (resolve, reject) {
    pool.query(LevelSQL, (error, results) => {
      if (error) {
        reject(error)
      }

      resolve(results.rows);
    })
  })
}

const getStacks = () => {
  return new Promise(function (resolve, reject) {
    pool.query(TechStackSQL, (error, results) => {
      if (error) {
        reject(error)
      }

      resolve(results.rows);
    })
  })
}

const getStates = () => {
  return new Promise(function (resolve, reject) {
    pool.query(StateSQL, (error, results) => {
      if (error) {
        reject(error)
      }

      resolve(results.rows);
    })
  })
}

const getCountRows = () => {
  return new Promise(function (resolve, reject) {
    pool.query(CustomSQL('COUNT(c.id)'), (error, results) => {
      if (error) {
        reject(error)
      }

      resolve(results.rows);
    })
  })
}

module.exports = {
  getCandidates,
  getCountRows,
  getLevels,
  geStacks: getStacks,
  getCandidatesTotal,
  getStates
}