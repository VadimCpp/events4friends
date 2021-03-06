/**
 * Class DetailedView renders calendar events.
 */
export default class DetailedView {
    
    /**
     * @param {!string} elementId
     * @public
     */
    constructor(elementId) {

        /**
         * @type {!string}
         * @private
         */
        this._elementId = elementId;
    }

    /**
     * @param {!Object} data
     * @param {Date} date
     * @public
     */
    render(data, date) {

        if (!data) {
            console.warn('SimpleView: cannot render null object. Skipped!');
            return;
        }
        
        if (date) {
            this._renderSpecificDate(data, date);
            return;
        }

        /**
         * The maximum number of events allowed to display
         *
         * @const {!number}
         */
        const upcomingTopN = 10;

        /**
         * @type {!Element}
         */
        let element = document.getElementById(this._elementId);

        /**
         * @type {!Array}
         */
        let result = [];

        /**
         * @type {!Array}
         */
        let upcomingResultTemp = [];


        /**
         * @type {!Array}
         */
        let upcomingResult = [];

        /**
         * @type {!number}
         */
        let upcomingCounter = 0;

        // Remove cancelled events, sort by date
        result = data.items.filter(item => item && item.hasOwnProperty('status') && item.status !== 'cancelled').sort(this._comp).reverse();

        let i;

        for (i in result) {
            if (!this._isPast(result[i].end.dateTime || result[i].end.date)) {
                upcomingResultTemp.push(result[i]);
            }
        }

        upcomingResultTemp.reverse();

        for (i in upcomingResultTemp) {
            if (upcomingCounter < upcomingTopN) {
                upcomingResult.push(upcomingResultTemp[i]);
                upcomingCounter++;
            }
        }

        /**
         * @type {!string}
         */
        let innerHTML = '<h1 class="h2"> Подробно </h1>';

        for (i in upcomingResult) {
            innerHTML += this._transformToArticle(upcomingResult[i]);
        }

        element.innerHTML = innerHTML;
    }

    /**
     * @param {Object} data
     * @param {Date} date
     * @private
     */
    _renderSpecificDate(data, date) {

        /**
         * @type {!Element}
         */
        let element = document.getElementById(this._elementId);

        /**
         * @type {!Array}
         */
        let result = data.items.filter(item => item && 
            item.hasOwnProperty('status') && 
            item.status !== 'cancelled' && 
            moment(item.start.dateTime).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')
        ).sort(this._comp).reverse();

        let i;

        /**
         * @type {!string}
         */
        let innerHTML = '<h1 class="h2"> Подробно </h1>';

        for (i in result) {
            innerHTML += this._transformToArticle(result[i]);
        }

        element.innerHTML = innerHTML;
    }

    /**
     * Check if date is later then now
     *
     * @param {!Date} date
     * @return {!boolean}
     * @private
     */
    _isPast(date) {
        /**
         * @type {!string}
         */
        let compareDate = new Date(date);

        /**
         * @type {!string}
         */
        let now = new Date();

        if (now.getTime() > compareDate.getTime()) {
            return true;
        }

        return false;
    };

    /**
     * Compare dates.
     *
     * @param {!Object} a
     * @param {!Object} b
     * @return {!number}
     * @private
     */
    _comp(a, b) {
        return new Date(a.start.dateTime || a.start.date).getTime() - new Date(b.start.dateTime || b.start.date).getTime();  
    }

    /**
     * Transforms record to a line
     *
     * @param {!Object} event
     * @return {!string}
     * @private
     */
    _transformToArticle(event) {
        /**
         * @type {!string}
         */
        let retVal = '<article class="mt-5 mb-5">';
        retVal += '<h2 class="h4 mb-0">' + '«' + event.summary + '»' + '</h2>';
        retVal += '<div>';

        /**
         * @type {!Array}
         */
        let dateStart = this._getDateInfo(event.start.dateTime || event.start.date);

        retVal += this._getFullFormattedDate(dateStart);

        retVal += '<p>' + event.description + '</p>';

        retVal += this._getFullLocation(event.location || ''),

        retVal += '</div>';
        retVal += '</article>';

        return retVal;
    }

    /**
     * Get temp array with information abou day in followin format: [day number, month number, year, hours, minutes]
     *
     * @type {!string} startDate
     * @return {!Array}
     * @private
     */
    _getDateInfo(startDate) {
        /**
         * @type {!Date}
         */
        let date = new Date(startDate);

        return [date.getDate(), date.getMonth(), date.getFullYear(), date.getHours(), date.getMinutes(), 0, 0];
    };


    /**
     * @type {!Array} dateStart
     * @return {!string} - date, month, year, day, time
     * @private
     */
    _getFullFormattedDate(dateStart) {
        /**
         * @type {!string}
         */        
        let formattedTime = ' в ' + this._getFormattedTime24(dateStart);
            
        /**
         * @type {!string}
         */  
        let dayNameStart = this._getDayNameFormatted(dateStart);

        return '<p>' 
            + dateStart[0] + ' ' 
            + this._getMonthName(dateStart[1]) + ' ' 
            + dateStart[2] + ', ' 
            + dayNameStart + ' ' 
            + formattedTime 
            + '</p>';
    }

    /**
     * @type {!Array} date
     * @return {!string} - hh:mm
     * @private
     */
    _getFormattedTime24(date) {
        var formattedTime = '',
            hour = date[3],
            minute = date[4];

        // Ensure 2-digit minute value.
        minute = (minute < 10 ? '0' : '') + minute;

        // Ensure 2-digit hour value.
        hour = (hour < 10 ? '0' : '') + hour;

        // Format time.
        formattedTime = hour + ':' + minute;

        return formattedTime;
    }

    /**
     * @type {!Array} dateFormatted
     * @return {!string} - ????
     * @private
     */
    _getDayNameFormatted(dateFormatted) {

        return this._getDayName(this._getDateFormatted(dateFormatted).getDay()) + ' ';

    }
    
    /**
     * @type {!number} day
     * @return {!string} - week day
     * @private
     */        
    _getDayName(day) {

        /**
         * @type {!Array}
         */        
        let dayNames = [
            'воскресенье', 
            'понедельник', 
            'вторник', 
            'среда', 
            'четверг', 
            'пятница', 
            'суббота'
        ];

        return dayNames[day];
    };    

    /**
     * @type {!Array} dateInfo
     * @return {!Date}
     * @private
     */        
    _getDateFormatted(dateInfo) {

        return new Date(dateInfo[2], dateInfo[1], dateInfo[0], dateInfo[3], dateInfo[4] + 0, 0);

    }

    /**
     * Get month name according to index.
     *
     * @type {!number} month
     * @return {!string}
     * @private
     */      
    _getMonthName(month) {

        /**
         * @type {!Array}
         */      
        let monthNames = [
            'января', 
            'февраля', 
            'марта', 
            'апреля', 
            'мая', 
            'июня', 
            'июля', 
            'августа', 
            'сентября', 
            'октября', 
            'ноября', 
            'декабря'
        ];

        return monthNames[month];
    };

    /**
     * @type {!string} location
     * @return {!string}
     * @private
     */   
    _getFullLocation(location) {
        return '<p>' + '📍&nbsp;&nbsp;' + location + '</p>';
    }

}