import winston from 'winston'

const meta: any = {
  host: process.env.HOST!,
}

const logger_ = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.json(),
  defaultMeta: meta,
})

if (process.env.NODE_ENV !== 'production') {
  logger_.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  )
} else {
  logger_.add(
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  )
  logger_.add(new winston.transports.File({ filename: 'combined.log' }))
}

export const logger = {
  child: (meta: any) => logger_.child(meta),
  log: (...args: any[]) => {
    logger_.info(args.join(' '))
  },
  info: (...args: any[]) => {
    logger_.info(args.join(' '))
  },
  debug: (...args: any[]) => {
    logger_.debug(args.join(' '))
  },
  error: (...args: any[]) => {
    logger_.error(args.join(' '))
  },
  warn: (...args: any[]) => {
    logger_.warn(args.join(' '))
  },
}
