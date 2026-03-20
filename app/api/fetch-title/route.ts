export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return Response.json({ error: 'URL required' }, { status: 400 })
  }

  let hostname: string
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NoteHUB/1.0)',
      },
      signal: AbortSignal.timeout(8000),
    })

    const html = await res.text()

    const ogTitle =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1]

    const rawTitle =
      ogTitle ??
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ??
      url

    return Response.json({ title: rawTitle.trim(), domain: hostname })
  } catch {
    return Response.json({ title: url, domain: hostname })
  }
}
