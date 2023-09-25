'use strict';
const aws = require('aws-sdk');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const documentClient = new DynamoDB.DocumentClient({ region: "ap-south-1" });

const isBookAvailable = (book, quantity) => {
  return (book.quantity - quantity) > 0;
};


module.exports.checkInventory = async (event) => {
  const { bookId, quantity } = event;


  try {
    let params = {
      TableName: 'bookTabel',
      KeyConditionExpression: 'bookId = :bookId',
      ExpressionAttributeValues: {
        ':bookId': bookId
      }
    };

    const result = await documentClient.query(params).promise();
    let book = result.Items[ 0 ];

    if (isBookAvailable(book, quantity)) {
      return book;
    } else {
      let bookOutOfStockError = new Error("The book is out of stock...");
      bookOutOfStockError.name = "BookOutOfStock";
      throw bookOutOfStockError;
    }

  } catch (e) {
    if (e.name === 'bookOutOfStock') {
      return e;
    } else {
      let bookNotFoundError = new Error("Book not found");
      bookNotFoundError.name = "BookNotFoundError";
      throw bookNotFoundError;
    }
  }
};

module.exports.calculateTotal = async (event) => {
  const { book, quantity } = event;
  let total = book.price * quantity;

  return { total };
};


