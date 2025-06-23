import { LucideProps, Loader2, Search, ExternalLink } from "lucide-react"
export const Icons = {
  spinner: Loader2,
  search: Search,
  externalLink: ExternalLink,
  logo: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/>
      <path d="M12 11v3"/>
      <path d="M10.5 13.5h3"/>
    </svg>
  ),
} 
