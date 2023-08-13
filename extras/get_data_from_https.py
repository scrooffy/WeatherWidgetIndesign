import os
import json
import requests
from bs4 import BeautifulSoup


def get_temp(td):
    return f'{td.find("span", class_="temperature_min").text}...{td.find("span", class_="temperature_max").text}'


def get_data(tr):
    temperature = get_temp(tr.find("td", class_="temperature"))
    status = tr.find("td", class_="note").text
    wind = tr.find("td", class_="wind").find("span", class_="wind_speed").text

    return (temperature, status, wind)


def save_data(weather_data):
    with open(os.path.join('extras', 'weather_data.json'), 'w', encoding='utf-8') as f:
        json.dump(weather_data, f, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    url = "https://weaf.ru/ru-sar/4483451545/10days"
    page = requests.get(url)
    soup = BeautifulSoup(page.content, "html.parser")

    tables = soup.find_all("table")
    res = dict()
    i = 0

    for table in tables[2:9]:
        caption = table.find("caption")
        current_day = caption.find("div", class_="nth-1").text
        current_day_data = caption.find("div", class_="nth-2")
        current_day_times = f'{current_day_data.find("span", class_="rise").text}, {current_day_data.find("span", class_="set").text}, {current_day_data.find("span", class_="duration").text}'

        t_body = table.find("tbody").find_all("tr")
        night_temp, night_status, night_wind = get_data(t_body[0])
        day_temp, day_status, day_wind = get_data(t_body[2])
        day_pressure = t_body[2].find("td", class_="pressure").text

        res[i] = {
            "day": current_day,
            "times_and_day_pressure": f'{current_day_times}, {day_pressure} мм.рт.ст.',
            "night_temp": night_temp,
            "day_temp": day_temp,
            "night_status": night_status,
            "day_status": day_status,
            "night_wind": night_wind + " м/с",
            "day_wind": day_wind + " м/с"
        }
        i += 1
    
    save_data(res)
