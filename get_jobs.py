import requests
import json
import os

# Define headers
headers = {
    "guestauth": "guest-user-268621",
    "apptype": "next",
    "version": "0.001"
}

# Define cookies
cookies = {
    "NEXT_LOCALE": "am",
    "_fbp": "fb.1.1705608348597.61870073",
    "_ga": "GA1.1.1556160695.1705608348",
    "_ga_9CTYF399EN": "GS1.1.1739012219.36.1.1739013829.27.0.0",
    "_gcl_au": "1.1.1738296767.1733682640",
    "isMobile": "true",
    "showToest": "1"
}

# URL for job search (with keyword HTML)
url = "https://staff.am/_next/data/kZvPsz7z173Ncr6cM3T5b/am/jobs.json"

ls_jobs_type = ["python", "html"]

# File path
file_path = "data/jobs.json"

# If file exists, delete it
if os.path.exists(file_path):
    os.remove(file_path)
    print(f"🗑️ Deleted existing file: {file_path}")

# Create an empty dictionary to store job data
existing_data = {}

for jobs_type in ls_jobs_type:

    params = {
        "key_word": f"{jobs_type}"
    }

    # Send GET request
    response = requests.get(url, headers=headers, cookies=cookies, params=params)

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()  # Parse JSON response

        # Extract job listings
        jobs = data["pageProps"]["jobs"]

        # Prepare job data for JSON
        job_list = []
        for job in jobs[:20]:  # Get only the first 20 jobs
            try:
                job_entry = {
                    "title": job["title"]["am"],
                    "company": job["companiesStruct"]["title"]["am"],
                    "location": job["job_city"]["title"]["am"],
                    "deadline": job["deadline"],
                    "profile_image": job["companiesStruct"]["profile_image"],
                    "job_link": f"https://staff.am/am/jobs/{job.get('category', {}).get('code', 'unknown')}/{job.get('slug', {}).get('am', 'unknown')}"
                }
                if job_entry["profile_image"] is not None:
                    job_list.append(job_entry)
            except Exception as e:
                print(f"⚠️ Error processing job: {e}")

        # Store job data
        existing_data[jobs_type] = job_list

        print(f"✅ Successfully added {len(job_list)} {jobs_type} jobs")

    else:
        print(f"❌ Error: {response.status_code}")

# Ensure directory exists
os.makedirs(os.path.dirname(file_path), exist_ok=True)

# Save the updated data to a new JSON file
with open(file_path, "w", encoding="utf-8") as json_file:
    json.dump(existing_data, json_file, ensure_ascii=False, indent=4)

print(f"✅ All jobs saved to '{file_path}'")
