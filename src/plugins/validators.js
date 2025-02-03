export const requiredValidator = (v) => !!v || 'This field is required'

export const dateValidator = (value) => {
    if (!value) return 'Дата обязательна'
    if (!/^\d{2}.\d{2}.\d{4}$/.test(value)) return 'Формат должен быть ДД.ММ.ГГГГ'
  
    const [day, month, year] = value.split('.').map(Number)
  
    // Check month
    if (month < 1 || month > 12) return 'Месяц должен быть от 01 до 12'
  
    // Check days based on month
    const daysInMonth = new Date(year, month, 0).getDate()
    if (day < 1 || day > daysInMonth) {
      return `День должен быть от 01 до ${daysInMonth} для выбранного месяца`
    }
  
    return true
  }
