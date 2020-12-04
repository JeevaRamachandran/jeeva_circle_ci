const { BigQuery } = require("@google-cloud/bigquery");
const { bq } = require("./config.json");
console.log(process.env.BQ_KEY);
const main = async () => {
  const { datasetId, projectId } = bq;
  const table = `${projectId}.${datasetId}.__TABLES__`;
  const query = `SELECT
    project_id,
    dataset_id,
    REGEXP_EXTRACT(table_id,r'(.*)_') AS tab,
TIMESTAMP_MILLIS(last_modified_time) last_updated_time,
  FROM
    ${table}
--   WHERE
--     DATE(TIMESTAMP_MILLIS(last_modified_time)) > DATE(DATE_ADD(CURRENT_TIMESTAMP(), -10, 'DAY'))
  ORDER BY
    last_modified_time DESC,
    table_id DESC`;
  const data = await execQuery(query);
  console.log(data);
};

const { projectId, clientEmail } = bq;

const gcpParams = {
  projectId,
  credentials: {
    private_key: process.env.BQ_KEY
      ? process.env.BQ_KEY.replace(/\\n/g, "\n")
      : null,
    client_email: clientEmail,
  },
};

const execQuery = async (query, filters) => {
  const bigquery = new BigQuery(gcpParams);
  const options = {
    query,
  };
  const [rows] = await bigquery.query(options);
  return rows;
};

main();
