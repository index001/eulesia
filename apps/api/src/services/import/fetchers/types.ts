/**
 * Shared interfaces for minute fetchers
 *
 * Each municipality system (CloudNC, Dynasty, Tweb) implements the MinuteFetcher
 * interface to provide a uniform way to fetch and extract meeting minutes.
 */

export interface Meeting {
  id: string
  pageUrl: string
  title: string
  date?: string
  organ?: string  // e.g., "Kunnanhallitus", "Valtuusto"
}

export interface MinuteSource {
  municipality: string
  type: string                    // 'cloudnc' | 'dynasty' | 'tweb'
  url: string
  region?: string                 // For welfare regions (hyvinvointialueet)
  pdfBasePath?: string            // Override default PDF path
  pathPrefix?: string             // e.g., '/D10_Haapajarvi' for Dynasty variations
}

export interface MinuteFetcher {
  type: string
  fetchMeetings(source: MinuteSource): Promise<Meeting[]>
  extractContent(meeting: Meeting, source: MinuteSource): Promise<string | null>
}
