import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
// import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly todosIndex = process.env.INDEX_NAME
    ) {}
  
    async getAllTodos(userId: string): Promise<TodoItem[]> {
      logger.info('Getting all todos')
  
      const result = await this.docClient
        .query({
          TableName: this.todosTable,
          IndexName: this.todosIndex,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        })
        .promise()
      const items = result.Items
      return items as TodoItem[]
    }
  
    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
      logger.info('creating a new todo')
  
      const result = await this.docClient
        .put({
          TableName: this.todosTable,
          Item: todoItem
        })
        .promise()
  
      logger.info('Todo item created: ', result)
  
      return todoItem
    }
  
    async updateTodoAttachmentUrl(
      todoId: string,
      userId: string,
      attachmentUrl: string
    ): Promise<void> {
      logger.info('Updating the attachment url of todo: ', todoId)
  
      await this.docClient
        .update({
          TableName: this.todosTable,
          Key: { todoId, userId },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': attachmentUrl
          }
        })
        .promise()
    }
  
    async updateTodoItem(
      todoId: string,
      userId: string,
      todoUpdate: UpdateTodoRequest
    ): Promise<TodoUpdate> {
      logger.info('Updating a todo item')
  
      const result = await this.docClient
        .update({
          TableName: this.todosTable,
          Key: { todoId, userId },
  
          UpdateExpression: `set #name = :name, dueDate = :dueDate, done = :done`,
          ExpressionAttributeValues: {
            ':name': todoUpdate.name,
            ':dueDate': todoUpdate.dueDate,
            ':done': todoUpdate.done
          },
          ExpressionAttributeNames: {
            '#name': 'name'
          },
          ReturnValues: 'ALL_NEW'
        })
        .promise()
  
      const todoItemUpdate = result.Attributes
      logger.info('Todo item updated: ', todoItemUpdate)
      return todoItemUpdate as TodoUpdate
    }
  
    async deleteTodoItem(userId: string, todoId: string): Promise<string> {
      logger.info('Deleting a todo')
  
      await this.docClient
        .delete({
          TableName: this.todosTable,
          Key: { todoId, userId }
        })
        .promise()
  
      logger.info('Todo deleted')
  
      return todoId as string
    }
  }