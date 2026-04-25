// Run separately: `npm run register-webhook`
// Registers your BUNQ_CALLBACK_URL with the bunq sandbox so payment events
// will POST to your Node server. Skip entirely if you only need the simulator.

import axios from 'axios'
import forge from 'node-forge'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

const BASE = (process.env.BUNQ_ENV || 'SANDBOX').toUpperCase() === 'PRODUCTION'
  ? 'https://api.bunq.com/v1'
  : 'https://public-api.sandbox.bunq.com/v1'

const KEY_FILE = './.bunq_key.pem'

function getKeys() {
  if (fs.existsSync(KEY_FILE)) {
    const pem = fs.readFileSync(KEY_FILE, 'utf8')
    const priv = forge.pki.privateKeyFromPem(pem)
    const pub = forge.pki.setRsaPublicKey(priv.n, priv.e)
    return { priv, pub: forge.pki.publicKeyToPem(pub) }
  }
  const kp = forge.pki.rsa.generateKeyPair({ bits: 2048 })
  fs.writeFileSync(KEY_FILE, forge.pki.privateKeyToPem(kp.privateKey))
  return { priv: kp.privateKey, pub: forge.pki.publicKeyToPem(kp.publicKey) }
}

const headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  'User-Agent': 'snap-node/1.0',
  'X-Bunq-Geolocation': '0 0 0 0 NL',
  'X-Bunq-Language': 'en_US',
  'X-Bunq-Region': 'en_US',
  'X-Bunq-Client-Request-Id': `snap-${Date.now()}`
}

async function authenticate() {
  const apiKey = process.env.BUNQ_API_KEY
  if (!apiKey) throw new Error('Set BUNQ_API_KEY in .env first.')
  const { pub } = getKeys()

  const inst = await axios.post(`${BASE}/installation`, { client_public_key: pub }, { headers })
  const instToken = inst.data.Response.find(r => r.Token)?.Token.token

  await axios.post(
    `${BASE}/device-server`,
    { description: 'snap-node', secret: apiKey, permitted_ips: ['*'] },
    { headers: { ...headers, 'X-Bunq-Client-Authentication': instToken } }
  )

  const sess = await axios.post(
    `${BASE}/session-server`,
    { secret: apiKey },
    { headers: { ...headers, 'X-Bunq-Client-Authentication': instToken } }
  )
  const sessionToken = sess.data.Response.find(r => r.Token)?.Token.token
  const userObj = sess.data.Response.find(r => r.UserPerson || r.UserCompany || r.UserApiKey)
  const userId = userObj?.UserPerson?.id || userObj?.UserCompany?.id || userObj?.UserApiKey?.id
  return { sessionToken, userId }
}

async function registerWebhook() {
  const callback = process.env.BUNQ_CALLBACK_URL
  if (!callback || callback.includes('YOUR-NGROK')) {
    throw new Error('Set BUNQ_CALLBACK_URL in .env to your public HTTPS URL.')
  }
  const { sessionToken, userId } = await authenticate()
  const r = await axios.post(
    `${BASE}/user/${userId}/notification-filter-url`,
    {
      notification_filters: [
        { category: 'PAYMENT', notification_target: callback },
        { category: 'MUTATION', notification_target: callback }
      ]
    },
    {
      headers: {
        ...headers,
        'X-Bunq-Client-Authentication': sessionToken,
        'X-Bunq-Client-Request-Id': `snap-reg-${Date.now()}`
      }
    }
  )
  console.log(`✅ Webhook registered for user ${userId} → ${callback}`)
  console.log(JSON.stringify(r.data, null, 2))
}

registerWebhook().catch(e => {
  console.error('❌', e.response?.data || e.message)
  process.exit(1)
})