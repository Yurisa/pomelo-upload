

module.exports = (db, style, url) => {
  const customLink = db.read().get('settings.customLink').value() || '$url'
  const tpl = {
    'markdown': `![](${url})`,
    'HTML': `<img src="${url}"/>`,
    'URL': url,
    'UBB': `[IMG]${url}[/IMG]`,
    'Custom': customLink.replace(/\$url/g, url)
  }
  return tpl[style]
}
