import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./Section.scss');
import {FaIcon} from 'ui/components';

interface SectionProps {
  title: string;
  icon?: any;
  children: any;
}

export const Section = (props: SectionProps) => {
  const {title, icon, children} = props;

  // TODO animate vanish into transparent on header click

  return (
    <div className={Styles.Section}>
      <header className={Styles.SectionHeader}>
        {icon && <FaIcon svg={icon} />}
        <h6 className={Styles.SectionTitle}>{title}</h6>
      </header>
      <div className={Styles.SectionBody}>
        {children}
      </div>
    </div>
  );
};
