// // import { ApiProperty } from '@nestjs/swagger'

// export class HealthCheckResponseDto {
//   @ApiProperty({
//     description: 'Status da API',
//     example: 'ok',
//     enum: ['ok', 'error']
//   })
//   status: string

//   @ApiProperty({
//     description: 'Status da conexão com o banco de dados',
//     example: 'connected',
//     enum: ['connected', 'disconnected']
//   })
//   database: string

//   @ApiProperty({
//     description: 'Mensagem de erro (apenas quando status for error)',
//     example: 'Database connection failed',
//     required: false
//   })
//   error?: string

//   @ApiProperty({
//     description: 'Timestamp da verificação',
//     example: '2023-06-01T12:34:56.789Z'
//   })
//   timestamp: string
// }
