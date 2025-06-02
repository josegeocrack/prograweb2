document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null")
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  // Show admin nav if user is admin
  if (currentUser.role === "admin") {
    document.getElementById("admin-nav").style.display = "block"
  }

  // Handle section navigation
  const sectionBtns = document.querySelectorAll(".section-btn")
  const bookingSections = document.querySelectorAll(".booking-section")

  sectionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSection = btn.getAttribute("data-section")

      // Update active button
      sectionBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")

      // Show target section, hide others
      bookingSections.forEach((section) => {
        if (section.id === targetSection) {
          section.classList.add("active")
        } else {
          section.classList.remove("active")
        }
      })
    })
  })

  // Initialize facility booking form
  initFacilityBooking()

  // Load available classes
  loadAvailableClasses()

  // Initialize complaint form
  initComplaintForm()

  // Handle logout
  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.removeItem("currentUser")
    window.location.href = "index.html"
  })

  // Mobile menu toggle
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })
  }

  // Handle direct navigation to specific sections via URL hash
  if (window.location.hash) {
    const targetSection = window.location.hash.substring(1)
    const targetBtn = document.querySelector(`.section-btn[data-section="${targetSection}"]`)
    if (targetBtn) {
      targetBtn.click()
    }
  }
})

function initFacilityBooking() {
  const facilityForm = document.getElementById("facility-booking-form")
  const facilityType = document.getElementById("facility-type")
  const bookingDate = document.getElementById("booking-date")
  const bookingTime = document.getElementById("booking-time")
  const availabilityStatus = document.getElementById("availability-status")

  // Set min date to today
  const today = new Date().toISOString().split("T")[0]
  bookingDate.min = today

  // Check availability when inputs change
  const checkAvailability = () => {
    const facility = facilityType.value
    const date = bookingDate.value
    const time = bookingTime.value
    const duration = document.getElementById("duration").value

    if (facility && date && time) {
      const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")

      // Check if there's a conflicting reservation
      const conflict = reservations.some((r) => {
        return r.facility === facility && r.date === date && r.time === time && !r.cancelled
      })

      if (conflict) {
        availabilityStatus.style.display = "block"
        availabilityStatus.className = "availability-check unavailable"
        availabilityStatus.querySelector(".availability-message").textContent =
          "This facility is already booked for the selected time."
      } else {
        availabilityStatus.style.display = "block"
        availabilityStatus.className = "availability-check available"
        availabilityStatus.querySelector(".availability-message").textContent = "Facility is available for booking!"
      }
    } else {
      availabilityStatus.style.display = "none"
    }
  }

  facilityType.addEventListener("change", checkAvailability)
  bookingDate.addEventListener("change", checkAvailability)
  bookingTime.addEventListener("change", checkAvailability)

  // Handle form submission
  facilityForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    const facility = facilityType.value
    const date = bookingDate.value
    const time = bookingTime.value
    const duration = document.getElementById("duration").value

    // Check availability one more time
    const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
    const conflict = reservations.some((r) => {
      return r.facility === facility && r.date === date && r.time === time && !r.cancelled
    })

    if (conflict) {
      alert("Sorry, this facility has just been booked by someone else. Please select another time.")
      return
    }

    // Create new reservation
    const newReservation = {
      id: "res-" + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      facility: facility,
      date: date,
      time: time,
      duration: duration,
      createdAt: new Date().toISOString(),
      cancelled: false,
    }

    reservations.push(newReservation)
    localStorage.setItem("reservations", JSON.stringify(reservations))

    alert("Facility booked successfully!")
    facilityForm.reset()
    availabilityStatus.style.display = "none"
  })
}

function loadAvailableClasses() {
  const classes = JSON.parse(localStorage.getItem("classes") || "[]")
  const classEnrollments = JSON.parse(localStorage.getItem("classEnrollments") || "[]")
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  const container = document.getElementById("available-classes")

  if (classes.length === 0) {
    container.innerHTML = '<div class="no-data">No classes available at the moment</div>'
    return
  }

  // Filter classes that are in the future
  const today = new Date()
  const futureClasses = classes.filter((c) => {
    const classDate = new Date(`${c.date}T${c.time}`)
    return classDate > today
  })

  if (futureClasses.length === 0) {
    container.innerHTML = '<div class="no-data">No upcoming classes available</div>'
    return
  }

  // Sort classes by date
  futureClasses.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateA - dateB
  })

  // Check if user is already enrolled in any class
  const userEnrollments = classEnrollments.filter((e) => e.userId === currentUser.id && !e.cancelled)
  const enrolledClassIds = userEnrollments.map((e) => e.classId)

  let html = ""

  futureClasses.forEach((classItem) => {
    const isEnrolled = enrolledClassIds.includes(classItem.id)
    const isFull = classItem.enrolled >= classItem.capacity
    const availableSpots = classItem.capacity - classItem.enrolled
    const fillPercentage = (classItem.enrolled / classItem.capacity) * 100

    html += `
      <div class="class-enrollment-card ${isFull ? "full" : ""}">
        <h4>${classItem.name}</h4>
        <div class="class-details">
          <p><strong>Trainer:</strong> ${classItem.trainer}</p>
          <p><strong>Date:</strong> ${formatDate(classItem.date)}</p>
          <p><strong>Time:</strong> ${formatTime(classItem.time)}</p>
          <p><strong>Description:</strong> ${classItem.description || "No description available"}</p>
        </div>
        <div class="class-capacity">
          <span>${availableSpots} spots left</span>
          <div class="capacity-bar">
            <div class="capacity-fill ${isFull ? "full" : ""}" style="width: ${fillPercentage}%"></div>
          </div>
          <span>${classItem.enrolled}/${classItem.capacity}</span>
        </div>
        ${
          isEnrolled
            ? '<button class="btn btn-secondary" disabled>Already Enrolled</button>'
            : isFull
              ? '<button class="btn btn-secondary" disabled>Class Full</button>'
              : `<button class="btn btn-primary enroll-btn" data-class-id="${classItem.id}">Enroll Now</button>`
        }
      </div>
    `
  })

  container.innerHTML = html

  // Add event listeners to enroll buttons
  document.querySelectorAll(".enroll-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const classId = btn.getAttribute("data-class-id")
      enrollInClass(classId)
    })
  })
}

function enrollInClass(classId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const classes = JSON.parse(localStorage.getItem("classes") || "[]")
  const classEnrollments = JSON.parse(localStorage.getItem("classEnrollments") || "[]")

  // Find the class
  const classItem = classes.find((c) => c.id === classId)
  if (!classItem) {
    alert("Class not found!")
    return
  }

  // Check if class is full
  if (classItem.enrolled >= classItem.capacity) {
    alert("Sorry, this class is now full.")
    return
  }

  // Check if user is already enrolled
  const alreadyEnrolled = classEnrollments.some(
    (e) => e.userId === currentUser.id && e.classId === classId && !e.cancelled,
  )

  if (alreadyEnrolled) {
    alert("You are already enrolled in this class!")
    return
  }

  // Create enrollment
  const newEnrollment = {
    id: "enroll-" + Date.now(),
    userId: currentUser.id,
    userName: currentUser.name,
    classId: classId,
    className: classItem.name,
    classDate: classItem.date,
    enrolledAt: new Date().toISOString(),
    cancelled: false,
  }

  // Update class enrollment count
  classItem.enrolled += 1

  // Save changes
  classEnrollments.push(newEnrollment)
  localStorage.setItem("classEnrollments", JSON.stringify(classEnrollments))
  localStorage.setItem("classes", JSON.stringify(classes))

  alert("You have successfully enrolled in the class!")

  // Reload available classes
  loadAvailableClasses()
}

function initComplaintForm() {
  const complaintForm = document.getElementById("complaint-form")
  const complaintType = document.getElementById("complaint-type")
  const specificSelection = document.getElementById("specific-selection")
  const specificLabel = document.getElementById("specific-label")
  const specificItem = document.getElementById("specific-item")

  // Handle complaint type change
  complaintType.addEventListener("change", () => {
    const type = complaintType.value

    if (!type) {
      specificSelection.style.display = "none"
      return
    }

    // Show specific selection based on type
    specificSelection.style.display = "block"

    switch (type) {
      case "facility":
        specificLabel.textContent = "Select Facility"
        populateFacilities(specificItem)
        break
      case "class":
        specificLabel.textContent = "Select Class"
        populateClasses(specificItem)
        break
      case "trainer":
        specificLabel.textContent = "Select Trainer"
        populateTrainers(specificItem)
        break
      default:
        specificSelection.style.display = "none"
        break
    }
  })

  // Handle form submission
  complaintForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    const type = complaintType.value
    const specificItemValue = specificItem.value
    const subject = document.getElementById("complaint-subject").value
    const description = document.getElementById("complaint-description").value
    const priority = document.getElementById("priority").value

    // Create new complaint
    const newComplaint = {
      id: "complaint-" + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      type: type,
      specificItem: specificItemValue,
      subject: subject,
      description: description,
      priority: priority,
      status: "pending",
      submittedAt: new Date().toISOString(),
    }

    // Save complaint
    const complaints = JSON.parse(localStorage.getItem("complaints") || "[]")
    complaints.push(newComplaint)
    localStorage.setItem("complaints", JSON.stringify(complaints))

    alert("Your feedback has been submitted successfully!")
    complaintForm.reset()
    specificSelection.style.display = "none"
  })
}

function populateFacilities(selectElement) {
  const facilities = [
    { id: "gym", name: "Modern Gym" },
    { id: "pool", name: "Swimming Pool" },
    { id: "tennis", name: "Tennis Court" },
    { id: "basketball", name: "Basketball Court" },
    { id: "yoga-room", name: "Yoga Room" },
    { id: "squash", name: "Squash Court" },
  ]

  let options = '<option value="">Please select a facility</option>'
  facilities.forEach((facility) => {
    options += `<option value="${facility.id}">${facility.name}</option>`
  })

  selectElement.innerHTML = options
}

function populateClasses(selectElement) {
  const classes = JSON.parse(localStorage.getItem("classes") || "[]")
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const classEnrollments = JSON.parse(localStorage.getItem("classEnrollments") || "[]")

  // Get classes user is enrolled in
  const userEnrollments = classEnrollments.filter((e) => e.userId === currentUser.id && !e.cancelled)
  const enrolledClasses = classes.filter((c) => userEnrollments.some((e) => e.classId === c.id))

  let options = '<option value="">Please select a class</option>'

  if (enrolledClasses.length === 0) {
    options += '<option value="" disabled>You are not enrolled in any classes</option>'
  } else {
    enrolledClasses.forEach((classItem) => {
      options += `<option value="${classItem.id}">${classItem.name} (${formatDate(classItem.date)})</option>`
    })
  }

  selectElement.innerHTML = options
}

function populateTrainers(selectElement) {
  const trainers = JSON.parse(localStorage.getItem("trainers") || "[]")

  let options = '<option value="">Please select a trainer</option>'
  trainers.forEach((trainer) => {
    options += `<option value="${trainer.id}">${trainer.name} (${trainer.specialty})</option>`
  })

  selectElement.innerHTML = options
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatTime(timeString) {
  // Convert 24-hour time to 12-hour format
  const [hours, minutes] = timeString.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12

  return `${hour12}:${minutes} ${ampm}`
}
