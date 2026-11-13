import { getVoterSession } from './session.server'

export async function requireVoter() {
    const session = await getVoterSession()
    if (!session.voterId) throw new Error('Access code required')
    return session.voterId
}