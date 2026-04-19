import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()

  const res = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
