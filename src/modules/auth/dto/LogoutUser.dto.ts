import { z } from 'zod'

const logoutUserSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' })
      .trim()
      .email({ message: 'Invalid email format' }),
    password: z.string({ required_error: 'Password is required' })
      .min(1, { message: "Password can't be empty" })
  })
})

type ILogoutUserDTO = z.infer<typeof logoutUserSchema>['body']

export { logoutUserSchema, ILogoutUserDTO }
