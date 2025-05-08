import { z } from 'zod'

const loginUserSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' })
      .trim()
      .email({ message: 'Invalid email format' }),
    password: z.string({ required_error: 'Password is required' })
      .min(1, { message: "Password can't be empty" })
  })
})

type ILoginUserDTO = z.infer<typeof loginUserSchema>['body']

export { loginUserSchema, ILoginUserDTO }
