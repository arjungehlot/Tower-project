import { useEffect, useRef, useState } from 'react'
import { Camera, RefreshCw, Upload, Check } from 'lucide-react'
import { Button } from '@/components/ui'

/** Camera preview → capture → retake/confirm. Falls back to file upload when no camera. Stores a small base64 JPEG. */
export function PhotoCapture({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const video = useRef<HTMLVideoElement>(null), canvas = useRef<HTMLCanvasElement>(null), file = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null), [shot, setShot] = useState(''), [err, setErr] = useState('')
  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream])
  useEffect(() => { if (stream && video.current) { video.current.srcObject = stream; video.current.play().catch(() => undefined) } }, [stream])
  const stop = () => { stream?.getTracks().forEach((t) => t.stop()); setStream(null) }
  const open = async () => {
    setErr('')
    try { if (!navigator.mediaDevices?.getUserMedia) throw new Error('no camera'); setStream(await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })) }
    catch { setErr('Camera unavailable — please upload a photo instead.') }
  }
  const snap = () => {
    const v = video.current, c = canvas.current; if (!v || !c) return
    c.width = 320; c.height = Math.round((320 * (v.videoHeight || 240)) / (v.videoWidth || 320)); c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height)
    setShot(c.toDataURL('image/jpeg', 0.7)); stop()
  }
  const upload = (f?: File) => {
    if (!f) return
    const r = new FileReader(); r.onload = () => { const img = new Image(); img.onload = () => { const c = canvas.current!; c.width = 320; c.height = Math.round((320 * img.height) / img.width); c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); setShot(c.toDataURL('image/jpeg', 0.7)) }; img.src = r.result as string }; r.readAsDataURL(f)
  }
  return (
    <div className="rounded-xl border border-dashed border-line p-3">
      <canvas ref={canvas} className="hidden" />
      <div className="mx-auto flex aspect-[4/3] w-full max-w-[260px] items-center justify-center overflow-hidden rounded-lg bg-subtle">
        {value ? <img src={value} alt="Visitor" className="h-full w-full object-cover" /> : shot ? <img src={shot} alt="Captured preview" className="h-full w-full object-cover" /> : stream ? <video ref={video} muted playsInline className="h-full w-full object-cover" /> : <Camera className="text-faint" size={32} />}
      </div>
      {err && <p role="alert" className="mt-2 text-center text-xxs text-warn">{err}</p>}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {value ? <Button size="sm" icon={<RefreshCw size={13} />} onClick={() => { onChange(''); setShot('') }}>Retake</Button>
          : shot ? <><Button size="sm" icon={<RefreshCw size={13} />} onClick={() => { setShot(''); open() }}>Retake</Button><Button size="sm" variant="primary" icon={<Check size={13} />} onClick={() => { onChange(shot); setShot('') }}>Use photo</Button></>
          : stream ? <Button size="sm" variant="primary" icon={<Camera size={13} />} onClick={snap}>Capture</Button>
          : <><Button size="sm" variant="primary" icon={<Camera size={13} />} onClick={open}>Open camera</Button><Button size="sm" icon={<Upload size={13} />} onClick={() => file.current?.click()}>Upload</Button></>}
      </div>
      <input ref={file} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
    </div>
  )
}
