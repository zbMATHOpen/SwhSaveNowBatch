import { greet, swh } from '..'

test('My Greeter', () => {
  expect(greet('Carl')).toBe('Hello Carl')
})

test('Get swh list', async () => swh())
