require('./_loadConfig')
import PuppeteerNationBuilder from '../src/index'

jest.setTimeout(60000)

describe('Nation Builder', () => {
  test('Clean snapshot', async () => {
    const nb = new PuppeteerNationBuilder(process.env.SITENAME)
    const page = await nb.logIn(process.env.USERNAME, process.env.USERPASS)
    const expected = 7
    const remain = await nb.cleanSnapshot('Daily snapshot', expected)
    await expect(page.title()).resolves.toBe('rightnowmn snapshots')
    nb.opts.browser.close()
    expect(remain <= expected).toBe(true)
  })
})
