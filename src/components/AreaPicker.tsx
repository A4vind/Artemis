import { useState } from 'react';
import { CITIES, localitiesIn, localityById, type CityId, type LocalityId } from '../data/localities';
import { useT } from '../i18n';
import { ChoiceGroup } from './ui';

interface Props {
  legend: string;
  legendHidden?: boolean;
  hint?: string;
  value: LocalityId | null;
  onChange: (v: LocalityId) => void;
  error?: string;
}

/** Pick the city first, then the area — keeps each list short enough to scan. */
export function AreaPicker({ legend, legendHidden, hint, value, onChange, error }: Props) {
  const { t, lang } = useT();
  const [city, setCity] = useState<CityId>(value ? localityById(value).city : 'pune');

  return (
    <div className="stack stack--sm">
      <ChoiceGroup
        legend={t('city.label')}
        layout="row"
        value={city}
        onChange={setCity}
        options={CITIES.map((c) => ({ value: c, label: t(`city.${c}`) }))}
      />
      <ChoiceGroup
        legend={legend}
        legendHidden={legendHidden}
        hint={hint}
        layout="chips"
        value={value}
        onChange={onChange}
        error={error}
        options={localitiesIn(city).map((l) => ({ value: l.id, label: l.name[lang] }))}
      />
    </div>
  );
}
