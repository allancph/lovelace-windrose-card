import {DirectionLabels} from "../config/DirectionLabels";
import {SpeedRangeService} from "../speed-range/SpeedRangeService";
import {SvgUtil} from "../renderer/SvgUtil";
import {RectCoordinates} from "../renderer/RectCoordinates";
import {DimensionCalculator} from "./DimensionCalculator";
import {DimensionCalculatorWindRose} from "./DImensionCalculatorWindRose";
import {WindSpeedEntity} from "../config/WindSpeedEntity";
import {CornersInfo} from "../config/CornersInfo";
import {SpeedRange} from "../speed-range/SpeedRange";

export class DimensionCalculatorBarRight extends DimensionCalculatorWindRose implements DimensionCalculator {

    readonly barHeight2: number;
    readonly barStartY2: number;
    readonly barBlockMarginLeft: number = 50;
    readonly barBlockMarginRight: number = 0;
    barSpeedLabelSpace: number[] = [];
    readonly barWidths: number[] = [];
    readonly barNameLabelSpace: number[] = [];
    readonly barSpeedLabelMargin: number = 10;
    readonly multiBarSpacing: number = 20;

    constructor(readonly directionLabels: DirectionLabels,
                readonly speedRangeServices: SpeedRangeService[],
                readonly windspeedEntities: WindSpeedEntity[],
                readonly cornersInfo: CornersInfo,
                readonly svgUtil: SvgUtil) {

        super(directionLabels, cornersInfo, svgUtil);

        this.barHeight2 = this.roseDiameter + this.directionLetterMargin;
        this.barStartY2 = this.roseMarginTop + this.directionLetterMargin + this.barHeight2;

        this.windspeedEntities.forEach((config: WindSpeedEntity, index: number) => {
            this.barWidths.push(svgUtil.getTextLength('99%', config.barPercentageTextSize) + 6);
            this.barNameLabelSpace.push(config.barLabelTextSize);
            this.barSpeedLabelSpace.push(this.determineSpeedLabelLength(this.speedRangeServices[index].getSpeedRanges(), config.barSpeedTextSize));
        });
    }

    determineSpeedLabelLength(speedRanges: SpeedRange[], speedTextSize: number): number {
        let maxRangeValue = 0;
        speedRanges.forEach((speedRange: SpeedRange) => {
            const length = this.svgUtil.getTextLength(speedRange.minSpeed + '', speedTextSize);
            if (length > maxRangeValue) {
                maxRangeValue = length;
            }
        });
        return maxRangeValue;
    }

    barStart(): number {
        return this.barStartY2;
    }

    barLength(): number {
        return this.barHeight2;
    }

    barWidth(index: number): number {
        return this.barWidths[index];
    }

    barHeight(): number {
        return this.barHeight2;
    }

    barStartX(positionIndex: number): number {
        var left = this.roseCompleteWidth + this.barBlockMarginLeft + this.barNameLabelSpace[0]
        for (let index = 0; index < positionIndex; index++) {
            left += this.barWidths[index] + this.barSpeedLabelMargin + this.barSpeedLabelSpace[index] + this.multiBarSpacing + this.barNameLabelSpace[index + 1];
        }
        return left;
    }

    barStartY(): number {
        return this.barStartY2;
    }

    barLabelX(positionIndex: number): number {
        return this.barStartX(positionIndex) - 10;
    }

    barLabelY(): number {
        return 0;
    }

    barSpeedLabelX(positionIndex: number) {
        return this.barStartX(positionIndex) + this.barWidths[positionIndex] + this.barSpeedLabelMargin;
    }

    barSpeedLabelY(): number {
        return this.barStartY();
    }

    barPercLabelX(positionIndex: number): number {
        return this.barStartX(positionIndex) + this.barWidth(positionIndex) / 2;
    }

    barPercLabelY(): number {
        throw new Error("NOOP");
    }

    touchFaceBar(positionIndex: number): RectCoordinates {
        return new RectCoordinates(
            this.barStartX(positionIndex) - this.barNameLabelSpace[positionIndex],
            0,
            this.barNameLabelSpace[positionIndex] + this.barWidths[positionIndex] + this.barSpeedLabelMargin + this.barSpeedLabelSpace[positionIndex],
            this.barStartY2);
    }

    viewBox(): string {
        const lastBarIndex = this.speedRangeServices.length - 1
        let barMaxX = this.barSpeedLabelX(lastBarIndex);
        barMaxX += this.barSpeedLabelSpace[lastBarIndex] + this.barBlockMarginRight;
        return "0 0 " + barMaxX + " " + this.roseCompleteHeight;
    }

}
