import { cpSync, mkdirSync, rmSync } from 'node:fs'

// Keep the upstream /graphen/ base and all three original HTML entry points.
rmSync('site', { recursive: true, force: true })
mkdirSync('site/graphen', { recursive: true })
cpSync('dist', 'site/graphen', { recursive: true })
cpSync('LICENSE', 'site/graphen/LICENSE.txt')
console.log('Prepared the original landing page, Studio and documentation at /graphen/.')
