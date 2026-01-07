type BusinessHours = {
  [key: string]: { open: string | null; close: string | null } | null
}

export function isBusinessOpen(businessHoursJson: string | null): { isOpen: boolean; message: string } {
  if (!businessHoursJson) {
    return { isOpen: true, message: 'We are currently open.' }
  }

  try {
    const hours: BusinessHours = JSON.parse(businessHoursJson)
    const now = new Date()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = dayNames[now.getDay()]
    const dayHours = hours[currentDay]

    if (!dayHours || !dayHours.open || !dayHours.close) {
      return { isOpen: false, message: 'We are currently closed. We will get back to you during business hours.' }
    }

    const [openHour, openMinute] = dayHours.open.split(':').map(Number)
    const [closeHour, closeMinute] = dayHours.close.split(':').map(Number)

    const openTime = new Date()
    openTime.setHours(openHour, openMinute, 0, 0)

    const closeTime = new Date()
    closeTime.setHours(closeHour, closeMinute, 0, 0)

    const currentTime = new Date()
    currentTime.setHours(now.getHours(), now.getMinutes(), 0, 0)

    const isOpen = currentTime >= openTime && currentTime <= closeTime

    if (isOpen) {
      return { isOpen: true, message: `We are currently open until ${dayHours.close}.` }
    } else {
      if (currentTime < openTime) {
        return { isOpen: false, message: `We are currently closed. We open at ${dayHours.open} today.` }
      } else {
        return { isOpen: false, message: `We are currently closed. We are open ${dayHours.open} to ${dayHours.close} on ${currentDay}.` }
      }
    }
  } catch (error) {
    return { isOpen: true, message: 'We are currently open.' }
  }
}








