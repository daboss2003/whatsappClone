import { format, differenceInHours, differenceInYears, differenceInMinutes, differenceInDays,  } from 'date-fns'

export function formatDate(time) {
    const now = new Date();
    const date = new Date(time)
    const diffInHours = differenceInHours(now, date);
    const diffInDays = differenceInDays(now, date)
    const diffInYear = differenceInYears(now, date);
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const isYesterday = date.getTime() === yesterday.getTime()

    if (isYesterday) {
        return 'Yesterday'
    }
    else if (diffInHours < 24) {
       return 'Today'
    }
    else if (diffInDays < 7) {
        return format(date, 'EEEE')
    }
    else if (diffInYear < 1) {
        return format(date, 'MMM d')
    }
    else {
        return format(date, 'yyy MMM d')
    }
}

export function formatTime(time) {
    const now = new Date();
    const date = new Date(time);
    const diffInMinutes = differenceInMinutes(now, date);
    if (diffInMinutes < 1) {
        return 'just now'
    }
    else {
        return format(date, 'hh:mm a');
    }
}

export function formatDuration(duration) {
  const mins = Math.floor((duration % 3600) / 60);
  const hrs = Math.floor(duration / 3600);
  const secs = Math.floor(duration % 60);
  return `${hrs > 0 ? `${hrs}:` : ''}${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`
}

export const formatPlayingTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };