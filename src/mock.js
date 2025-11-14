import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { sampleData } from './sampleData'

const mock = new MockAdapter(axios, { delayResponse: 300 })

// GET /api/stats
mock.onGet('/api/stats').reply(200, sampleData.stats)

// GET /api/pgs
mock.onGet('/api/pgs').reply(200, sampleData.pgs)

// POST /api/pgs - create pg
mock.onPost('/api/pgs').reply(config => {
  const body = JSON.parse(config.data)
  body.id = Math.random().toString(36).slice(2,9)
  sampleData.pgs.push(body)
  return [201, body]
})

// GET /api/pgs/:id
mock.onGet(new RegExp('/api/pgs/[^/]+$')).reply(config => {
  const id = config.url.split('/').pop()
  const pg = sampleData.pgs.find(p=>p.id===id)
  return pg ? [200, pg] : [404]
})

// POST /api/pgs/:id/floors
mock.onPost(new RegExp('/api/pgs/.+/floors')).reply(config=>{
  const id = config.url.split('/')[3]
  const body = JSON.parse(config.data)
  const pg = sampleData.pgs.find(p=>p.id===id)
  if(!pg) return [404]
  pg.floors.push(body)
  return [201, body]
})

// other mocked endpoints can be added similarly
console.log('Mock backend active (axios-mock-adapter)') 
