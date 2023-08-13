#include "./extras/json2.js"

function get_weather_data(path) {
    // FUCK ADOBE, why i'm should using python istead of get html and scrap data in this file???
    // thanks restix.jsx (which generates a VBScript code), we can get access to https
    // but where is DOMParse???
    var data_file = new File(path);
    var data;
    if(data_file !== false) {
        data_file.open('r');
        var content = data_file.read();
        data_file.close();
        data = JSON.parse(content);
    }

    return data;
}

function add_textFrame(page, size, content, position, group) {
    var text_frame = page.textFrames.add({
        geometricBounds: [
            position.Y,
            position.X,
            position.Y + size.Heigth,
            position.X + size.Width
        ],
        contents: content
    });
    group.push(text_frame);

    return text_frame;
}

function get_script_dir() {
	try{
		return app.activeScript.path;
	}
	catch(e){
		return File(e.fileName).path;
	}
}

function main() {
    var document = app.activeDocument;
    var last_page = document.pages[7];

    const img_src = new File(get_script_dir() + "/extras/img.tif");
    const data = get_weather_data(get_script_dir() + "/extras/weather_data.json");

    const tf_label_size =       {Heigth: 17, Width: 82};
    const frame_img_size =      {Heigth: 17, Width: 26};
    const tf_info_label_size =  {Heigth: 4, Width: 78};
    const tf_day_size =         {Heigth: 6, Width: 82};
    const tf_temperature_size = {Heigth: 6, Width: 27};
    const tf_weather_size =     {Heigth: 6, Width: 38};
    const tf_wind_size =        {Heigth: 6, Width: 17};
    const line_width =          84;
    const weather_frame_width = 82;

    const paragraph_center = document.paragraphStyles.itemByName("Текст по центру");
    const colors = {
        White: document.swatches[2],
        Black: document.swatches[3],
        Cyan: document.swatches[4]
    };

    const initial_position = {
        X: 5,
        Y: 5
    };
    var current_position = {
        X: initial_position.X,
        Y: initial_position.Y
    };

    var group_items = [];

    var tf_label = add_textFrame(last_page, tf_label_size, "Предварительный\rПРОГНОЗ ПОГОДЫ\rв Лысых Горах", current_position, group_items);
    tf_label.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
    tf_label.paragraphs.everyItem().appliedParagraphStyle = paragraph_center;
    tf_label.paragraphs.everyItem().sameParaStyleSpacing = 2;
    tf_label.paragraphs.everyItem().fillColor = colors.Cyan;
    tf_label.paragraphs.everyItem().fontStyle = "Bold Italic";
    tf_label.paragraphs[0].pointSize = 11;
    tf_label.paragraphs[1].pointSize = 15;
    tf_label.paragraphs[2].pointSize = 13;

    var frame_img = last_page.rectangles.add({
        geometricBounds: [
            current_position.Y,
            current_position.X,
            current_position.Y + frame_img_size.Heigth,
            current_position.X + frame_img_size.Width
        ]
    });
    frame_img.textWrapPreferences.textWrapMode = TextWrapModes.BOUNDING_BOX_TEXT_WRAP;
    frame_img.place(img_src);
    group_items.push(frame_img);
    current_position.Y += tf_label_size.Heigth;

    var temp_pos = {X: current_position.X + 2, Y: current_position.Y + 1}; // Позиционивание со смещением
    var tf_info_label = add_textFrame(last_page, tf_info_label_size, "Прогноз погоды подготовлен с использованием Интернет-ресурсов", temp_pos, group_items);
    tf_info_label.fillColor = colors.Black;
    tf_info_label.fillTint = 40;
    tf_info_label.strokeColor = colors.Black;
    tf_info_label.strokeTint = 15;
    tf_info_label.strokeWeight = 1;
    tf_info_label.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
    tf_info_label.paragraphs[0].appliedParagraphStyle = paragraph_center;
    tf_info_label.paragraphs[0].pointSize = 6;
    tf_info_label.paragraphs[0].fontStyle = "Bold";
    tf_info_label.paragraphs[0].fillColor = colors.White;
    current_position.Y += tf_info_label_size.Heigth + 2;

    for(var i = 0; i < 7; i++) {
        var tf_day = add_textFrame(
            last_page, 
            tf_day_size, 
            data[i].day + '\r' + data[i].times_and_day_pressure, 
            current_position,
            group_items);
        tf_day.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
        tf_day.paragraphs.everyItem().appliedParagraphStyle = paragraph_center;
        tf_day.paragraphs[0].fontStyle = "Bold";
        current_position.Y += tf_day_size.Heigth;

        var tf_temperature = add_textFrame(
            last_page, 
            tf_temperature_size, 
            "Ночью " + data[i].night_temp + "\rДнём " + data[i].day_temp, 
            current_position,
            group_items);
        tf_temperature.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
        tf_temperature.paragraphs.everyItem().appliedParagraphStyle = paragraph_center;
        current_position.X += tf_temperature_size.Width;
        
        var tf_weather = add_textFrame(
            last_page, 
            tf_weather_size, 
            data[i].night_status + '\r' + data[i].day_status, 
            current_position,
            group_items);
        
        tf_weather.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
        tf_weather.paragraphs.everyItem().appliedParagraphStyle = paragraph_center;
        current_position.X += tf_weather_size.Width;
        
        var tf_wind = add_textFrame(
            last_page, 
            tf_wind_size, 
            data[i].night_wind + '\r' + data[i].day_wind, 
            current_position,
            group_items);
        tf_wind.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
        tf_wind.paragraphs.everyItem().appliedParagraphStyle = paragraph_center;
        current_position.X = initial_position.X;
        current_position.Y += tf_wind_size.Heigth;

        if (i != 6) {   // Ко всем дням недели, кроме последнего, внизу рисуется линия
            var line = last_page.graphicLines.add({
                strokeWeight: 2,
                strokeColor: colors.Black,
                strokeTint: 30,
            });
            current_position.Y += 2;
            line.paths[0].pathPoints[0].anchor = [current_position.X + 2, current_position.Y];
            line.paths[0].pathPoints[1].anchor = [line_width, current_position.Y];
            group_items.push(line);
            current_position.Y += 2;
        }
    }

    var weather_frame = last_page.rectangles.add({
        geometricBounds: [
            initial_position.Y,
            initial_position.X,
            current_position.Y + 1,
            current_position.X + weather_frame_width,
        ],
        strokeWeight: 2,
        strokeColor: colors.Cyan
    });
    group_items.push(weather_frame);

    var group = last_page.groups.add(group_items);
}

main();
