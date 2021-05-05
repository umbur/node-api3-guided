const yup = require('yup');
const Hubs = require('./hubs-model.js');

function logger(req, res, next) {
  console.log(`
    ${req.method} request to ${req.baseUrl} endpoint!
    req.body ${JSON.stringify(req.body)}
    req.params.id ${req.params.id}
  `)
  next()
}

async function idChecker(req, res, next) {
  try {
    const hub = await Hubs.findById(req.params.id)
    if (!hub) {
      next({ status: 404, message: `hub with id ${req.params.id} not found!` })
    } else {
      req.hub = hub
      next()
    }
  } catch (err) {
    next(err)
  }
}

const messageSchema = yup.object({
  sender: yup.string()
    .trim()
    .required('sender required')
    .min(3, 'sender must be 3 chars')
    .max(40, 'sender must be under 40 chars'),
  text: yup.string()
    .trim()
    .required('text required')
    .min(3, 'text must be 3 chars')
    .max(40, 'text must be under 40 chars'),
})

async function validateMessage(req, res, next) {
  try {
    const validated = await messageSchema.validate(req.body, {
      stripUnknown: true,
    })
    req.body = validated
    next()
  } catch (err) {
    // here validation failed
    next({ status: 400, message: err.message })
  }
}

module.exports = { validateMessage, logger, idChecker, }
