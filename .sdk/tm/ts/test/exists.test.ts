
import { test, describe } from 'node:test'
import { equal } from 'node:assert'


import { MabeMouserSDK } from '..'


describe('exists', async () => {

  test('test-mode', () => {
    const testsdk = MabeMouserSDK.test()
    equal(testsdk instanceof MabeMouserSDK, true,
      'MabeMouserSDK.test() must return a client synchronously')
  })

})
