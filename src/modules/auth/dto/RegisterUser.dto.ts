import { z } from 'zod'

const registerUserSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' })
      .trim()
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(50, { message: 'Name must be at most 50 characters long' }),
    email: z.string({ required_error: 'Email is required' })
      .trim()
      .email({ message: 'Invalid email format' }),
    password: z.string({ required_error: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(70, { message: 'Password must be at most 70 characters long' })
  })
})

type IRegisterUserDTO = z.infer<typeof registerUserSchema>['body']

export { registerUserSchema, IRegisterUserDTO }
