export const dateToISO = date => date.toLocaleDateString('en-CA')

export const timeToHHMMSS = time => {
    let hours = Math.floor(time / 2)
    let minutes = (time % 2) * 30
    let seconds = 0
    if(time == 48) {
        hours = 23
        minutes = 59
        seconds = 59
    }
    hours = hours.toString().padStart(2, '0')
    minutes = minutes.toString().padStart(2, '0')
    seconds = seconds.toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
}


export const daysBetween = (aDate, bDate) => {
    // do date difference in UTC to avoid Daylight Savings Time
    const aUTC = Date.UTC(aDate.getFullYear(), aDate.getMonth(), aDate.getDate())
    const bUTC = Date.UTC(bDate.getFullYear(), bDate.getMonth(), bDate.getDate())
    const MS_PER_DAY = 1000 * 60 * 60 * 24
    return Math.floor((bUTC - aUTC) / MS_PER_DAY)
}
