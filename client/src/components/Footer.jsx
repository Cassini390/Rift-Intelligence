import { Meta } from './primitives.jsx'

// Legal footer. Riot's "Legal Jibber Jabber" policy requires the disclaimer
// text below to appear verbatim on any shared fan project, and the API Terms
// forbid implying Riot endorsement — so this stays visible in-app.
export default function Footer() {
  return (
    <footer className="relative border-t border-hair mt-4">
      <div className="mx-auto max-w-[980px] px-5 sm:px-7 py-8">
        <div className="flex items-center gap-3 mb-3">
          <Meta className="text-goldsoft">§ Notice</Meta>
          <span className="flex-1 h-px bg-hair" />
        </div>
        <p className="font-mono text-[10px] leading-relaxed tracking-[0.06em] text-faint max-w-[720px]">
          Rift Intelligence was created under Riot Games' "Legal Jibber Jabber"
          policy using assets owned by Riot Games. Riot Games does not endorse or
          sponsor this project.
        </p>
        <p className="font-mono text-[10px] leading-relaxed tracking-[0.06em] text-faint/70 max-w-[720px] mt-2">
          League of Legends and Riot Games are trademarks or registered trademarks
          of Riot Games, Inc. This is an unofficial, non-commercial tool with no
          affiliation to Riot Games. Match and champion data are retrieved from the
          official Riot Games API and Data Dragon.
        </p>
      </div>
    </footer>
  )
}
