require('./_loadConfig')
import PuppeteerNationBuilder from '../src/index'

jest.setTimeout(60000)

describe('Test login', () => {
  test('successfully login', async () => {
    const nb = new PuppeteerNationBuilder(process.env.SITENAME)
    const page = await nb.logIn(process.env.USERNAME, process.env.USERPASS)
    await expect(page.title()).resolves.toBe('rightnowmn snapshots')
    nb.opts.browser.close()
  })
})
