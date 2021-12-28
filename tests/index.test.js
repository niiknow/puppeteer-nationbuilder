require('./_loadConfig')
import PuppeteerNationBuilder from '../src/index'

jest.setTimeout(60000)

describe('Nation Builder', () => {
  test('create daily snapshot', async () => {
    const nb = new PuppeteerNationBuilder(process.env.SITENAME)
    const page = await nb.logIn(process.env.USERNAME, process.env.USERPASS)
    await expect(page.title()).resolves.toBe(process.env.SITENAME + ' snapshots')
    nb.opts.browser.close()
  })

  test('clean snapshot', async () => {
    const nb = new PuppeteerNationBuilder(process.env.SITENAME)
    const page = await nb.logIn(process.env.USERNAME, process.env.USERPASS)
    const expected = 7
    const remain = await nb.cleanSnapshot(expected)
    await expect(page.title()).resolves.toBe(process.env.SITENAME + ' snapshots')
    nb.opts.browser.close()
    expect(remain).toBeLessThanOrEqual(expected)
  })

  test('download first snapshot', async () => {
    const nb = new PuppeteerNationBuilder(process.env.SITENAME)
    const page = await nb.logIn(process.env.USERNAME, process.env.USERPASS)
    const expected = '/tmp/puppeteerdl'
    const filePath = await nb.fetchFirstSnapshot('/tmp/puppeteerdl')
    await expect(page.title()).resolves.toBe(process.env.SITENAME + ' snapshots')
    nb.opts.browser.close()
    expect(filePath).toMatch(new RegExp(`^${expected}?`))
  })
})
