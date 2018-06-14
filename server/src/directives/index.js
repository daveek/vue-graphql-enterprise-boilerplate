const { AuthError, BadRequestError } = require('../errors')
const { calculateQueryDepth } = require('../utils')

const getUser = ({ request: { user } = {} }) => user

const getQueryStr = ({ request: { body: { query } = '' } }) => query

const hasRole = (roles, ctx) => {
  const { role } = getUser(ctx) || {}
  return role && roles.includes(role)
}

module.exports = {
  isAuthenticated(next, source, args, ctx) {
    if (getUser(ctx)) return next()
    throw new AuthError('Access Token is missing or might be expired')
  },

  hasRole(next, source, { roles }, ctx) {
    if (hasRole(roles, ctx)) return next()
    throw new AuthError('Insufficient permissions')
  },

  isAdmin(next, source, args, ctx) {
    if (hasRole(['ADMIN'], ctx)) return next()
    throw new AuthError('Insufficient permissions')
  },

  maxDepth(next, source, args, ctx) {
    const query = getQueryStr(ctx)
    if (calculateQueryDepth(query) <= args.depth) return next()
    throw new BadRequestError('Your query is too long!')
  },
}
