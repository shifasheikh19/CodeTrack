import axios from 'axios';

export async function getLeetCodeData(username) {
  const url = `https://leetcode-api-faisalshohag.vercel.app/${username}`;
  const { data } = await axios.get(url);

  return Object.entries(data.submissionCalendar).map(([key, val]) => ({
    date: new Date(parseInt(key) * 1000),
    value: val,
    source: "LeetCode"
  }));
}

export async function getCodeforcesData(handle) {
  const url = `https://codeforces.com/api/user.rating?handle=${handle}`;
  const { data } = await axios.get(url);

  if (data.status !== "OK") throw new Error("Codeforces API error");

  return data.result.map(entry => ({
    date: new Date(entry.ratingUpdateTimeSeconds * 1000),
    value: 1,
    source: "Codeforces"
  }));
}
