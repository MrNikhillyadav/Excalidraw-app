import z from "zod"

export const CreateUserSchema = z.object({
    username : z.string().min(3,"username too short").max(20,"too large uername"),
    email : z.string().email(),
    password : z.string().min(4,"password too short").max(16,"too large password"),
})

export const SinginSchema = z.object({
    email : z.string().email(),
    password : z.string().min(4,"password too short").max(16,"too large password"),
})

export const CreateRoomSchema = z.object({
    name : z.string().min(3).max(20),
})
