// sampledata.js
export const sampleData = {
  stats: {
    totalBeds: 120,
    filledBeds: 95,
    upcomingVacatingBeds: 5,
    currentMonthJoined: 8,
    last3MonthsJoined: 20,
    lastMonthVacated: 3,
    last3MonthsVacated: 9,
    upcomingVacationsThisMonth: 4
  },
  pgs: [
    {
      id: 'pg1',
      name: 'Bliss mens PG',
      address: 'MG Road, City',
      floors: [
        { number: 1, rooms: [
          { number: '101', sharing: 2, ac: false, beds: [
            {
              id: 'B1',
              occupied: true,
              tenant: { name: 'Ravi', start: '2025-09-01', end: '2026-01-15', phone: '9876543210' },
              history: [
                { tenantName: 'Sanjay', start: '2025-05-01', end: '2025-08-20' },
                { tenantName: 'Tarun',  start: '2024-12-01', end: '2025-04-30' }
              ]
            },
            {
              id: 'B2',
              occupied: false,
              history: [
                { tenantName: 'Ajay',  start: '2025-03-01', end: '2025-06-15' },
                { tenantName: 'Vikas', start: '2024-10-10', end: '2025-02-28' }
              ]
            }
          ]},
          { number: '102', sharing: 3, ac: true, beds: [
            {
              id: 'B1',
              occupied: true,
              tenant: { name: 'Asha', start: '2025-10-01', end: '2025-11-10', phone: '9123456780' },
              history: [
                { tenantName: 'Meena', start: '2025-06-01', end: '2025-09-20' }
              ]
            },
            {
              id: 'B2',
              occupied: true,
              tenant: { name: 'Kumar', start: '2025-08-01', end: '2026-02-01', phone: '9988776655' },
              history: [
                { tenantName: 'Rohit', start: '2025-01-05', end: '2025-07-15' }
              ]
            },
            {
              id: 'B3',
              occupied: false,
              history: []
            }
          ]},
          { number: '103', sharing: 3, ac: true, beds: [
            {
              id: 'B1',
              occupied: true,
              tenant: { name: 'Asha', start: '2025-10-01', end: '2025-11-10', phone: '9123456780' },
              history: [
                { tenantName: 'Meena', start: '2025-06-01', end: '2025-09-20' }
              ]
            },
            {
              id: 'B2',
              occupied: true,
              tenant: { name: 'Kumar', start: '2025-08-01', end: '2026-02-01', phone: '9988776655' },
              history: [
                { tenantName: 'Rohit', start: '2025-01-05', end: '2025-07-15' }
              ]
            },
            {
              id: 'B3',
              occupied: false,
              history: []
            }
          ]},
          { number: '104', sharing: 3, ac: true, beds: [
            {
              id: 'B1',
              occupied: true,
              tenant: { name: 'Asha', start: '2025-10-01', end: '2025-11-10', phone: '9123456780' },
              history: [
                { tenantName: 'Meena', start: '2025-06-01', end: '2025-09-20' }
              ]
            },
            {
              id: 'B2',
              occupied: true,
              tenant: { name: 'Kumar', start: '2025-08-01', end: '2026-02-01', phone: '9988776655' },
              history: [
                { tenantName: 'Rohit', start: '2025-01-05', end: '2025-07-15' }
              ]
            },
            {
              id: 'B3',
              occupied: false,
              history: []
            }
          ]},
          { number: '105', sharing: 3, ac: true, beds: [
            {
              id: 'B1',
              occupied: true,
              tenant: { name: 'Asha', start: '2025-10-01', end: '2025-11-10', phone: '9123456780' },
              history: [
                { tenantName: 'Meena', start: '2025-06-01', end: '2025-09-20' }
              ]
            },
            {
              id: 'B2',
              occupied: true,
              tenant: { name: 'Kumar', start: '2025-08-01', end: '2026-02-01', phone: '9988776655' },
              history: [
                { tenantName: 'Rohit', start: '2025-01-05', end: '2025-07-15' }
              ]
            },
            {
              id: 'B3',
              occupied: false,
              history: []
            }
          ]},
          { number: '106', sharing: 3, ac: true, beds: [
            {
              id: 'B1',
              occupied: true,
              tenant: { name: 'Asha', start: '2025-10-01', end: '2025-11-10', phone: '9123456780' },
              history: [
                { tenantName: 'Meena', start: '2025-06-01', end: '2025-09-20' }
              ]
            },
            {
              id: 'B2',
              occupied: true,
              tenant: { name: 'Kumar', start: '2025-08-01', end: '2026-02-01', phone: '9988776655' },
              history: [
                { tenantName: 'Rohit', start: '2025-01-05', end: '2025-07-15' }
              ]
            },
            {
              id: 'B3',
              occupied: false,
              history: []
            }
          ]},
          { number: '107', sharing: 3, ac: true, beds: [
            {
              id: 'B1',
              occupied: true,
              tenant: { name: 'Asha', start: '2025-10-01', end: '2025-11-10', phone: '9123456780' },
              history: [
                { tenantName: 'Meena', start: '2025-06-01', end: '2025-09-20' }
              ]
            },
            {
              id: 'B2',
              occupied: true,
              tenant: { name: 'Kumar', start: '2025-08-01', end: '2026-02-01', phone: '9988776655' },
              history: [
                { tenantName: 'Rohit', start: '2025-01-05', end: '2025-07-15' }
              ]
            },
            {
              id: 'B3',
              occupied: false,
              history: []
            },
            {
              id: 'B4',
              occupied: true,
              tenant: { name: 'Kumar', start: '2025-08-01', end: '2026-02-01', phone: '9988776655' },
              history: [
                { tenantName: 'Rohit', start: '2025-01-05', end: '2025-07-15' }
              ]
            }

          ]}

        ]},
        { number: 2, rooms: [
          { number: '201', sharing: 2, ac: false, beds: [
            {
              id: 'B1',
              occupied: true,
              tenant: { name: 'Imran', start: '2025-09-05', end: null, phone: '9000000001' },
              history: [
                { tenantName: 'Arun', start: '2025-04-01', end: '2025-08-28' }
              ]
            },
            { id: 'b7', occupied: false, history: [] }
          ]},
          { number: '202', sharing: 3, ac: true, beds: [
            { id: 'b8',  occupied: false, history: [] },
            { id: 'b9',  occupied: true,  tenant: { name: 'Neeraj', start: '2025-07-01', end: null, phone: '9000000002' }, history: [] },
            { id: 'b10', occupied: false, history: [] }
          ]}
        ]},
        { number: 3, rooms: [
          { number: '301', sharing: 2, ac: false, beds: [
            { id: 'b11', occupied: false, history: [] },
            { id: 'b12', occupied: false, history: [] }
          ]},
          { number: '302', sharing: 3, ac: true, beds: [
            { id: 'b13', occupied: false, history: [] },
            { id: 'b14', occupied: false, history: [] },
            { id: 'b15', occupied: false, history: [] }
          ]}
        ]}
      ]
    },
    {
      id: 'pg2', // fixed duplicate id
      name: 'Bliss womens PG',
      address: 'MG Road, City',
      floors: [
        { number: 1, rooms: [
          { number: '101', sharing: 2, ac: false, beds: [
            { id: 'wb1', occupied: true,  tenant: { name: 'Divya', start: '2025-08-15', end: null, phone: '9000000101' }, history: [] },
            { id: 'wb2', occupied: false, history: [] }
          ]},
          { number: '102', sharing: 3, ac: true, beds: [
            { id: 'wb3', occupied: false, history: [] },
            { id: 'wb4', occupied: true, tenant: { name: 'Pooja', start: '2025-09-10', end: null, phone: '9000000102' }, history: [] },
            { id: 'wb5', occupied: false, history: [] }
          ]}
        ]},
        { number: 2, rooms: [
          { number: '201', sharing: 2, ac: true, beds: [
            { id: 'wb6', occupied: false, history: [] },
            { id: 'wb7', occupied: false, history: [] }
          ]},
          { number: '202', sharing: 3, ac: false, beds: [
            { id: 'wb8', occupied: false, history: [] },
            { id: 'wb9', occupied: false, history: [] },
            { id: 'wb10', occupied: false, history: [] }
          ]}
        ]}
      ]
    }
  ]
}
