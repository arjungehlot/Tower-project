import { Link } from 'react-router-dom'
import { FileQuestion, Lock } from 'lucide-react'
import { Button } from '@/components/ui'
import { useMe } from '@/hooks/useMe'
import { HOME } from '@/utils/permissions'
const Box = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => { const { me } = useMe(); return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center"><span className="rounded-full bg-subtle p-4 text-faint">{icon}</span><h1 className="text-lg font-bold">{title}</h1><p className="max-w-sm text-xs text-muted">{text}</p><Link to={me ? HOME[me.role] : '/login'}><Button variant="primary">Go to home</Button></Link></div> }
export const NotFound = () => <Box icon={<FileQuestion size={28} />} title="Page not found" text="The page you are looking for does not exist or has moved." />
export const Unauthorized = () => <Box icon={<Lock size={28} />} title="Not authorised" text="Your role does not have access to this area." />
