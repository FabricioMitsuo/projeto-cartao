import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../config.js';

const client = new DynamoDBClient({
  endpoint: config.dynamodb.endpoint,
  region: config.dynamodb.region
});

export const ddb = DynamoDBDocumentClient.from(client);

export const TABLES = {
  Users: 'Users',
  Sessions: 'Sessions',
  Accounts: 'Accounts',
  Loans: 'Loans',
  Investments: 'Investments',
  Audit: 'Audit',
  Notifications: 'Notifications'
};

export async function getItem(table, key) {
  const res = await ddb.send(new GetCommand({ TableName: table, Key: key }));
  return res.Item ?? null;
}

export async function putItem(table, item) {
  await ddb.send(new PutCommand({ TableName: table, Item: item }));
}

export async function updateItem(table, key, updateExpr, exprAttrValues, exprAttrNames) {
  await ddb.send(
    new UpdateCommand({
      TableName: table,
      Key: key,
      UpdateExpression: updateExpr,
      ExpressionAttributeValues: exprAttrValues,
      ExpressionAttributeNames: exprAttrNames
    })
  );
}

