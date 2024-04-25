import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { fetch } from 'cross-fetch';
import React, { OlHTMLAttributes, Ref, forwardRef } from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import AddressSearch from '../index';
import ErrorBoundary from './ErrorBoundary';
import { selection } from './__fixtures__/selection';
import { server } from './server';
import { errorHandler } from './serverHandlers';
global.fetch = fetch;

console.error = vi.fn();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Component: AddressSearch', () => {
  it('has basic functionality', async () => {
    const onSelectFn = vi.fn();

    const { getByTestId, findByTestId } = render(
      <AddressSearch
        locale="en-GB"
        apiKey="1234"
        onSelect={onSelectFn}
        limit={10}
      />
    );

    const input = getByTestId('react-loqate-input');

    expect(input).toBeDefined();

    act(() => {
      fireEvent.change(input, { target: { value: 'a' } });
    });

    await waitFor(() => {
      expect(input).toHaveValue('a');
    });

    const list = await findByTestId('react-loqate-list');

    await waitFor(() => {
      expect(list).toBeDefined();
      expect(list.childNodes).toHaveLength(10);
    });

    const firstListItem = await screen.findByTestId(
      'react-loqate-list-item-GB|RM|A|21415581'
    );

    act(() => {
      fireEvent.click(firstListItem);
    });

    await waitFor(() => {
      expect(onSelectFn.mock.calls.length).toBe(1);
      expect(onSelectFn).toHaveBeenCalledWith(selection.Items[0]);
    });
  });

  it('renders default', async () => {
    const component = render(
      <AddressSearch locale="en-GB" apiKey="1234" onSelect={vi.fn()} />
    );

    expect(component.baseElement).toMatchSnapshot();
  });

  it('renders with classname', async () => {
    const { baseElement, getByTestId } = render(
      <AddressSearch
        locale="en-GB"
        apiKey="1234"
        onSelect={vi.fn()}
        className="some-classname"
      />
    );

    const wrapper = getByTestId('react-loqate');

    expect(wrapper.className).toBe('some-classname');
    expect(baseElement).toMatchSnapshot();
  });

  it('allows for alternative url', async () => {
    const { baseElement, findByTestId, getByTestId } = render(
      <AddressSearch
        locale="en-GB"
        apiKey="1234"
        apiUrl="https://foo.bar"
        onSelect={vi.fn()}
      />
    );

    const input = getByTestId('react-loqate-input');

    act(() => {
      fireEvent.change(input, { target: { value: 'a' } });
    });

    const list = await findByTestId('react-loqate-list');

    await waitFor(() => {
      expect(list).toBeDefined();
      expect(list.childNodes).toHaveLength(1);
    });

    await screen.findByTestId('react-loqate-list-item-baz');
    expect(baseElement).toMatchSnapshot();
  });

  it('renders with custom classes', async () => {
    const { getByTestId, findByTestId } = render(
      <AddressSearch
        locale="en-GB"
        apiKey="some-key"
        onSelect={vi.fn()}
        limit={5}
        inline
        classes={{
          input: 'input-class',
          list: 'list-class',
          listItem: 'list-item-class',
        }}
      />
    );

    const input = getByTestId('react-loqate-input');
    expect(input).toHaveClass('input-class');

    act(() => {
      fireEvent.change(input, { target: { value: 'a' } });
    });

    await waitFor(() => {
      expect(input).toHaveValue('a');
    });
    const list = await findByTestId('react-loqate-list');
    expect(list).toHaveClass('list-class');

    const firstListItem = await screen.findByTestId(
      'react-loqate-list-item-GB|RM|A|21415581'
    );
    expect(firstListItem).toHaveClass('list-item-class');
  });

  it('renders with custom components', async () => {
    const { baseElement, getByTestId, findByTestId } = render(
      <AddressSearch
        locale="en-GB"
        apiKey="1234"
        onSelect={vi.fn()}
        components={{
          Input: (props) => <input {...props} data-testid="custom-input" />,
          List: forwardRef(
            (
              props: OlHTMLAttributes<HTMLUListElement>,
              ref: Ref<HTMLUListElement>
            ): JSX.Element => {
              return <ul {...props} data-testid="custom-list" ref={ref} />;
            }
          ),
          ListItem: (props) => <li {...props} data-testid="custom-list-item" />,
        }}
      />
    );

    const input = getByTestId('custom-input');

    expect(baseElement).toMatchSnapshot();
    expect(input).toBeDefined();

    act(() => {
      fireEvent.change(input, { target: { value: 'a' } });
    });

    await waitFor(() => {
      expect(input).toHaveValue('a');
    });

    const list = await findByTestId('custom-list');
    expect(list).toBeDefined();

    const listItems = await screen.findAllByTestId('custom-list-item');
    const firstListItem = listItems[0];
    expect(firstListItem).toBeDefined();
  });

  it('renders with portal results', async () => {
    const { getByTestId, findByTestId } = render(
      <AddressSearch
        locale="en-GB"
        apiKey="some-key"
        onSelect={vi.fn()}
        limit={5}
      />
    );

    const input = getByTestId('react-loqate-input');

    expect(input).toBeDefined();

    act(() => {
      fireEvent.change(input, { target: { value: 'a' } });
    });

    await waitFor(() => {
      expect(input).toHaveValue('a');
    });

    const list = await findByTestId('react-loqate-list');

    await waitFor(() => {
      expect(list).toBeDefined();
      expect(list.childNodes).toHaveLength(10);
    });

    const wrapper = getByTestId('react-loqate');

    expect(wrapper).toMatchSnapshot();
    expect(wrapper).not.toContainElement(list);
  });

  it('renders with inline results', async () => {
    const onSelectFn = vi.fn();

    const { getByTestId, findByTestId } = render(
      <AddressSearch
        locale="en-GB"
        apiKey="some-key"
        onSelect={onSelectFn}
        limit={5}
        inline
      />
    );

    const input = getByTestId('react-loqate-input');

    expect(input).toBeDefined();

    act(() => {
      fireEvent.change(input, { target: { value: 'a' } });
    });

    await waitFor(() => {
      expect(input).toHaveValue('a');
    });

    const list = await findByTestId('react-loqate-list');

    await waitFor(() => {
      expect(list).toBeDefined();
      expect(list.childNodes).toHaveLength(10);
    });

    const firstListItem = await screen.findByTestId(
      'react-loqate-list-item-GB|RM|A|21415581'
    );

    act(() => {
      fireEvent.click(firstListItem);
    });

    const wrapper = getByTestId('react-loqate');

    expect(wrapper).toMatchSnapshot();
    expect(wrapper).toContainElement(list);

    await waitFor(() => {
      expect(onSelectFn.mock.calls.length).toBe(1);
      expect(onSelectFn).toHaveBeenCalledWith(selection.Items[0]);
    });
  });

  it.skip('can click away', async () => {
    const { getByTestId, findByTestId } = render(
      <AddressSearch
        locale="en-GB"
        apiKey="some-key"
        onSelect={vi.fn()}
        limit={5}
        inline
      />
    );

    const input = getByTestId('react-loqate-input');

    expect(input).toBeDefined();

    act(() => {
      fireEvent.change(input, { target: { value: 'a' } });
    });

    await waitFor(() => {
      expect(input).toHaveValue('a');
    });

    const list = await findByTestId('react-loqate-list');

    await waitFor(() => {
      expect(list).toBeDefined();
      expect(list.childNodes).toHaveLength(10);
    });

    act(() => {
      fireEvent.click(input);
    });

    await waitFor(() => {
      expect(list.childNodes).toHaveLength(0);
      expect(list.hidden).toBe(true);
    });
  });

  it.skip('can inline click away', async () => {
    const { getByTestId, findByTestId } = render(
      <AddressSearch
        locale="en-GB"
        apiKey="some-key"
        onSelect={vi.fn()}
        limit={5}
        inline
      />
    );

    const input = getByTestId('react-loqate-input');

    expect(input).toBeDefined();

    act(() => {
      fireEvent.change(input, { target: { value: 'a' } });
    });

    await waitFor(() => {
      expect(input).toHaveValue('a');
    });

    const list = await findByTestId('react-loqate-list');

    await waitFor(() => {
      expect(list).toBeDefined();
      expect(list.childNodes).toHaveLength(10);
    });

    act(() => {
      fireEvent.click(input);
    });

    await waitFor(() => {
      expect(list.childNodes).toHaveLength(0);
      expect(list.hidden).toBe(true);
    });
  });

  it('lets its errors be caught by an ErrorBoundary', async () => {
    server.use(errorHandler);
    const { baseElement, findByTestId, getByTestId } = render(
      <ErrorBoundary>
        <AddressSearch locale="en-GB" apiKey="1234" onSelect={vi.fn()} />
      </ErrorBoundary>
    );

    const input = getByTestId('react-loqate-input');

    act(() => {
      fireEvent.change(input, { target: { value: 'a' } });
    });

    const errorNotification = await findByTestId('error-notification');

    await waitFor(() => {
      expect(errorNotification).toBeDefined();
    });

    expect(baseElement).toMatchSnapshot();
  });
});
