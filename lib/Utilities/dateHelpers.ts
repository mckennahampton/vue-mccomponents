export const timestampToISO = (stamp: string) => {
    let temp = new Date(stamp)
    // return `${temp.getFullYear()}-${temp.getMonth()}-${temp.getDate()}`
    return temp.toISOString().split('T')[0]
}

export const timestampToLocaleTime = (stamp: string) => {
    let temp = new Date(stamp)
    return temp.toLocaleTimeString()
}

export const timestampToLocaleDate = (stamp: string) => {
    let temp = new Date(stamp)
    return temp.toLocaleDateString()
}

export function timeDiff(input: string | Date, summarize = true) {
    //today, now!
    //Get the diff
    input = input instanceof Date ? input : new Date(input)
    let now = new Date()
    let start = input > now ? new Date() : input
    let end = input > now ? input : new Date()
    let suffix = input > now ? ' from now' : ' ago'
    let diff = +(new Date(end)) - +(new Date(start))

    //Create numbers for dividing to get hour, minute and second diff
    var units = [1000 * 60 * 60 * 24, 1000 * 60 * 60, 1000 * 60, 1000]

    var rv = [] as number[] // h, m, s array
    //loop through d, h, m, s. we are not gonna use days, its just there to subtract it from the time
    for (var i = 0; i < units.length; ++i) {
        let result = Math.floor(diff / units[i])
        rv.push(result)
        diff = diff % units[i]
    }

    //Get the year of this year
    var thisFullYear = end.getFullYear()
    //Check how many days there where in last month
    var daysInLastMonth = new Date(thisFullYear, end.getMonth(), 0).getDate()
    //Get this month
    var thisMonth = end.getMonth()
    //Subtract to get difference between years
    thisFullYear = thisFullYear - start.getFullYear()
    //Subtract to get difference between months
    thisMonth = thisMonth - start.getMonth()
    //If month is less than 0 it means that we are some moths before the start date in the year.
    // So we subtract one year, and add the negative number (month) to 12. (12 + -1 = 11)
    let subAddDays = daysInLastMonth - start.getDate()
    let thisDay = end.getDate()
    thisMonth = thisMonth - 1
    if (thisMonth < 0) {
        thisFullYear = thisFullYear - 1
        thisMonth = 12 + thisMonth
        //Get ends day of the month
    }
    //Subtract the start date from the number of days in the last month, add add the result to todays day of the month
    subAddDays = daysInLastMonth - start.getDate()
    subAddDays = thisDay + subAddDays

    if (subAddDays >= daysInLastMonth) {
        subAddDays = subAddDays - daysInLastMonth
        thisMonth++
        if (thisMonth > 11) {
            thisFullYear++
            thisMonth = 0
        }
    }
    if (summarize == true) {
        if (thisFullYear > 0) {
            return (
                thisFullYear + " year" + (thisFullYear > 1 ? "s" : "") + suffix
            );
        }
        if (thisMonth > 0) {
            return thisMonth + " month" + (thisMonth > 1 ? "s" : "") + suffix
        }
        if (subAddDays > 0) {
            return subAddDays + " day" + (subAddDays > 1 ? "s" : "") + suffix
        }
        if (rv[1] > 0) {
            return rv[1] + " hour" + (rv[1] > 1 ? "s" : "") + suffix
        }
        if (rv[2] > 0) {
            return rv[2] + " minute" + (rv[2] > 1 ? "s" : "") + suffix
        }
        if (rv[3] > 0) {
            return rv[3] + " second" + (rv[3] > 1 ? "s" : "") + suffix
        }
    } else {
        return {
            years: thisFullYear,
            months: thisMonth,
            days: subAddDays,
            hours: rv[1],
            minutes: rv[2],
            seconds: rv[3]
        }
    }
}