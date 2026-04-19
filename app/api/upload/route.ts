import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!

    const res = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: true, mensaje_error: msg }, { status: 500 })
  }
}
