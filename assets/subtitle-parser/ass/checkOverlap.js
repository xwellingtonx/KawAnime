import _ from 'lodash'

const isBetween = (v, start, end) => {
  return v <= end && v >= start
}

const getOverlapTime = (time, duration, cues) => {
  const masterTimeline = {
    start: time,
    end: time + duration
  }

  return _.map(cues, (cue, i) => {
    const timeline = {
      start: cue.time,
      end: cue.time + cue.duration
    }

    if (isBetween(timeline.start, masterTimeline.start, masterTimeline.end)) {
      return cue
    } else if (isBetween(timeline.end, masterTimeline.start, masterTimeline.end)) {
      return cue
    }
  })
}

export default function (info, cue, cues) {
  const {
    line: masterLine,
    time: masterTime,
    duration: masterDuration,
    text
  } = cue

  // We'll ignore style-related size.
  const re = /font_\d{2,3}px/
  const fontSize = ((re.test(text) && text.match(re)[0].slice(5, -2)) || +info.FontSize)
  const height = +info.ResY

  const vFontOffset = Math.round((fontSize / height) * 100)

  const atSameTimeCues = getOverlapTime(masterTime, masterDuration, cues)

  atSameTimeCues.forEach((c) => {
    const { line, position } = c

    if (isBetween(masterLine, line - 1, line + 1)) {
      cue.position += position < 50
        ? vFontOffset
        : -vFontOffset
    }
  })

  return cue
}
