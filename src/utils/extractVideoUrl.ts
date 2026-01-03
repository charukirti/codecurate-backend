export interface YoutubeResult {
  videoId: string | null;
  playlistId: string | null;
}

export function extractVideoUrl(url: string | undefined): YoutubeResult {
  try {
    if (!url) {
      throw new Error('Invalid YouTube URL');
    }

    let safeUrl = url.trim();

    if (!safeUrl.startsWith('http://') && !safeUrl.startsWith('https://')) {
      safeUrl = 'https://' + safeUrl;
    }

    const videoUrl = new URL(safeUrl);

    const isYoutube =
      videoUrl.hostname.includes('youtube.com') ||
      videoUrl.hostname.includes('youtu.be');

    if (!isYoutube) {
      return { videoId: null, playlistId: null };
    }

    let videoId: string | null = null;
    let playlistId: string | null = null;

    if (videoUrl.hostname === 'youtu.be') {
      videoId = videoUrl.pathname.slice(1) || null;
    } else if (videoUrl.pathname.startsWith('/embed/')) {
      videoId = videoUrl.pathname.split('/embed/')[1] || null;
    } else {
      videoId = videoUrl.searchParams.get('v');
    }

    playlistId = videoUrl.searchParams.get('list');

    if (videoId && videoId.length === 0) videoId = null;
    if (playlistId && playlistId.length === 0) playlistId = null;

    return { videoId, playlistId };
  } catch (error) {
    throw new Error(
      `Invalid YouTube URL: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
