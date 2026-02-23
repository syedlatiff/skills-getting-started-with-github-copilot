document.addEventListener("DOMContentLoaded", () => {
  const activitiesGrid = document.getElementById("activities-grid");
  const activityModal = document.getElementById("activity-modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const categoryFilters = document.querySelectorAll(".category-filter");
  const availabilityFilters = document.querySelectorAll(".availability-filter");
  const clearFiltersBtn = document.getElementById("clear-filters");
  const sortBySelect = document.getElementById("sort-by");
  const modalSignupForm = document.getElementById("modal-signup-form");
  const modalMessage = document.getElementById("modal-message");
  
  let allActivities = {};
  let currentFilters = {
    categories: new Set(["All"]),
    availability: new Set(["available", "full"])
  };

  // Fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      allActivities = await response.json();
      renderActivities(allActivities);
    } catch (error) {
      activitiesGrid.innerHTML = "<p class='error'>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Render activities based on current filters and sort
  function renderActivities(activities) {
    let filteredActivities = Object.entries(activities);

    // Apply category filter
    if (!currentFilters.categories.has("All")) {
      filteredActivities = filteredActivities.filter(([_, details]) => {
        const category = details.category || "Other";
        return currentFilters.categories.has(category);
      });
    }

    // Apply availability filter
    filteredActivities = filteredActivities.filter(([_, details]) => {
      const spotsLeft = details.max_participants - details.participants.length;
      const isAvailable = spotsLeft > 0;
      return (isAvailable && currentFilters.availability.has("available")) ||
             (!isAvailable && currentFilters.availability.has("full"));
    });

    // Apply sorting
    const sortBy = sortBySelect.value;
    filteredActivities.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a[0].localeCompare(b[0]);
        case "availability":
          const spotsA = a[1].max_participants - a[1].participants.length;
          const spotsB = b[1].max_participants - b[1].participants.length;
          return spotsB - spotsA;
        case "schedule":
          return a[1].schedule.localeCompare(b[1].schedule);
        default:
          return 0;
      }
    });

    // Render activities as cards
    if (filteredActivities.length === 0) {
      activitiesGrid.innerHTML = "<p class='no-results'>No activities found matching your filters.</p>";
      return;
    }

    activitiesGrid.innerHTML = "";
    filteredActivities.forEach(([name, details]) => {
      const spotsLeft = details.max_participants - details.participants.length;
      const isAvailable = spotsLeft > 0;
      const category = details.category || "Other";

      const card = document.createElement("div");
      card.className = `activity-card-detailed ${!isAvailable ? "full" : ""}`;
      card.innerHTML = `
        <div class="card-badge">${category}</div>
        <h4>${name}</h4>
        <p class="description">${details.description}</p>
        <div class="card-details">
          <p><strong>📅 Schedule:</strong> ${details.schedule}</p>
          <p><strong>👥 Spots:</strong> <span class="spots-left ${isAvailable ? 'available' : 'full'}">${spotsLeft}/${details.max_participants}</span></p>
          <p><strong>📍 Participants:</strong> ${details.participants.length}</p>
        </div>
        <button class="card-action-btn ${!isAvailable ? 'disabled' : ''}" ${!isAvailable ? 'disabled' : ''}>
          ${isAvailable ? 'Learn More & Sign Up' : 'Activity Full'}
        </button>
      `;

      card.querySelector(".card-action-btn").addEventListener("click", () => {
        if (isAvailable) {
          openActivityModal(name, details);
        }
      });

      activitiesGrid.appendChild(card);
    });
  }

  // Open modal with activity details
  function openActivityModal(activityName, details) {
    const spotsLeft = details.max_participants - details.participants.length;
    
    document.getElementById("modal-activity-name").textContent = activityName;
    document.getElementById("modal-activity-details").innerHTML = `
      <div class="modal-details">
        <p><strong>Category:</strong> ${details.category || "Other"}</p>
        <p><strong>Description:</strong> ${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Available Spots:</strong> ${spotsLeft} out of ${details.max_participants}</p>
        <p><strong>Current Participants:</strong> ${details.participants.length}</p>
      </div>
    `;

    modalMessage.className = "hidden";
    modalSignupForm.dataset.activityName = activityName;
    activityModal.classList.remove("hidden");
  }

  // Close modal
  function closeActivityModal() {
    activityModal.classList.add("hidden");
  }

  // Handle filter changes
  categoryFilters.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const value = checkbox.value;
      if (value === "All") {
        // Clear all filters except "All"
        categoryFilters.forEach(cb => {
          cb.checked = false;
        });
        checkbox.checked = true;
        currentFilters.categories = new Set(["All"]);
      } else {
        // Uncheck "All" if any specific category is checked
        const allCheckbox = document.querySelector('input[value="All"]');
        if (checkbox.checked) {
          allCheckbox.checked = false;
          currentFilters.categories.delete("All");
          currentFilters.categories.add(value);
        } else {
          currentFilters.categories.delete(value);
          if (currentFilters.categories.size === 0) {
            allCheckbox.checked = true;
            currentFilters.categories.add("All");
          }
        }
      }
      renderActivities(allActivities);
    });
  });

  availabilityFilters.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const value = checkbox.value;
      if (checkbox.checked) {
        currentFilters.availability.add(value);
      } else {
        currentFilters.availability.delete(value);
      }
      renderActivities(allActivities);
    });
  });

  // Clear all filters
  clearFiltersBtn.addEventListener("click", () => {
    categoryFilters.forEach(cb => cb.checked = false);
    document.querySelector('input[value="All"]').checked = true;
    availabilityFilters.forEach(cb => cb.checked = true);
    currentFilters = {
      categories: new Set(["All"]),
      availability: new Set(["available", "full"])
    };
    renderActivities(allActivities);
  });

  // Sort change
  sortBySelect.addEventListener("change", () => {
    renderActivities(allActivities);
  });

  // Modal event listeners
  closeModalBtn.addEventListener("click", closeActivityModal);
  window.addEventListener("click", (event) => {
    if (event.target === activityModal) {
      closeActivityModal();
    }
  });

  // Handle modal form submission
  modalSignupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("modal-email").value;
    const activityName = modalSignupForm.dataset.activityName;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      const result = await response.json();

      if (response.ok) {
        modalMessage.textContent = result.message;
        modalMessage.className = "success";
        modalSignupForm.reset();
        
        // Refresh activities
        await fetchActivities();
        
        // Close modal after 2 seconds
        setTimeout(() => {
          closeActivityModal();
        }, 2000);
      } else {
        modalMessage.textContent = result.detail || "An error occurred";
        modalMessage.className = "error";
      }

      modalMessage.classList.remove("hidden");
    } catch (error) {
      modalMessage.textContent = "Failed to sign up. Please try again.";
      modalMessage.className = "error";
      modalMessage.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize
  fetchActivities();
});
