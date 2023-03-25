import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
// import { TodoUpdate } from '../models/TodoUpdate'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic

const logger = createLogger('TodoAccess')
const attachmentUtils = new AttachmentUtils()
const todoAccess = new TodosAccess()

export async function createTodo(
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info('creating a new todo')
  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)

  const newItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachmentUrl: s3AttachmentUrl,
    ...newTodo
  }

  return await todoAccess.createTodoItem(newItem)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Fetching all todos')
  const todos = await todoAccess.getAllTodos(userId)

  return todos
}

export async function updateTodo(
  todoId: string,
  todoUpdate: UpdateTodoRequest,
  userId: string
): Promise<TodoUpdate> {
  logger.info(`Updating todo with details: ${todoUpdate}`)

  return todoAccess.updateTodoItem(todoId, userId, todoUpdate)
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<string> {
  logger.info('Deleting todo item')

  return todoAccess.deleteTodoItem(userId, todoId)
}

export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
): Promise<string> {
  logger.info('Generating pre-signed upload url: for: ', userId, todoId)

  const url = attachmentUtils.getUploadUrl(todoId)

  logger.info(
    `url generated: url starts here =========== ${url} ========= url ends here`
  )

  return url as string
}